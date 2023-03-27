function WalkArea()
{
	this.areas = [];
}

WalkArea.prototype.clear = function()
{
	this.areas = [];
}

//add shape as an array of points 3D: [[-5,0,5],[5,0,5], ... ]
WalkArea.prototype.addShape = function(shape)
{
	this.areas.push( shape );
}

WalkArea.prototype.addRect = function(start,width,depth)
{
	if(start.length < 3)
		throw("start position must be a 3d position")
	let size = [width,0,depth];
	let p1 = [start[0],start[1],start[2]];
	let p2 = [start[0],start[1],start[2] + size[2]];
	let p3 = [start[0] + size[0],start[1],start[2] + size[2]];
	let p4 = [start[0] + size[0],start[1],start[2]];
	let rect = [p1,p2,p3,p4];
	this.areas.push( rect );
	return rect;
}

WalkArea.prototype.toJSON = function()
{
	return {
		areas: JSON.parse( JSON.stringify( this.areas ) )
	};
}

WalkArea.prototype.fromJSON = function(o)
{
	this.areas = JSON.parse( JSON.stringify( o.areas ) )
}

WalkArea.prototype.getVertices = function( matrix )
{
	if(!this.areas.length)
		return null;

	let vertices = [];
	for(let j = 0; j < this.areas.length; ++j)
	{
		let area = this.areas[j];
		for(let i = 0, l = area.length; i < l; ++i)
		{
			let p1 = area[i];
			let p2 = (i+1) === l ? area[0] : area[i+1];
			if( matrix )
			{
				p1 = vec3.transformMat4(vec3.create(),p1,matrix);
				p2 = vec3.transformMat4(vec3.create(),p2,matrix);
			}
			vertices.push( p1, p2 );
		}
	}

	return new Float32Array(vertices.flat());
}

//Modified so that it checks if it is inside 1 area only
WalkArea.prototype.isInsideArea = function(pos)
{
	let inside = 0
	for(let i = 0; i < this.areas.length; ++i)
	{
		let area = this.areas[i];
		let points = area.flat(); //from array of points to array of numbers
		if( pointInShape( pos, points ) )
			inside++
	}

	return !(inside === 0 || inside > 1);
}

WalkArea.prototype.adjustPosition = function(name, pos)
{
	if(pos.length < 3)
		throw("pos must be 3D");

	if(!this.areas.length)
		return pos;

	//check if inside
	if( this.isInsideArea( pos ) )
		return pos;

	//if not inside
	let min_dist = 100000;
	let nearest = null;

	for(let j = 0; j < this.areas.length; ++j)
	{
		let area = this.areas[j];
		for(let i = 0, l = area.length; i < l; ++i)
		{
			let p1 = area[i];
			let p2 = (i+1) === l ? area[0] : area[i+1];
			let nearest_to_segment = nearestToLine2D( pos, p1, p2 );
			let dist = vec3.distance( pos, nearest_to_segment );
			if(dist > min_dist)
				continue;
			min_dist = dist;
			nearest = nearest_to_segment;
		}
	}

	nearest[1] = pos[1]; //same Y
	WORLD.users[name].target = nearest
	return nearest;
}

function pointInShape( pos , shape ) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
	let is_3d = pos.length === 3;
	let x = pos[0];
	let y = pos[ is_3d ? 2 : 1];
    let inside = false;
	let l = shape.length;
	let offset = is_3d ? 3 : 2;

    for (let i = 0, j = l - offset; i < l; j = i, i += offset ) {
        let xi = shape[i], yi = shape[i + (is_3d ? 2 : 1)];
        let xj = shape[j], yj = shape[j + (is_3d ? 2 : 1)];
        
		//works by testing an horizontal semi-infinite line starting at P and going to the right
        let intersect = ((yi > y) !== (yj > y)) //first test if it lays in the y range of the segment
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi); //then test in which side of the plane it lies
        if (intersect)
			inside = !inside;
    }
    
    return inside;
}

function nearestToLine2D( p, a, b ) {
    let y_index = p.length === 3 ? 2 : 1;
    let atob = [b[0] - a[0], b[y_index] - a[y_index]];
    let atop = [p[0] - a[0], p[y_index] - a[y_index]];
    let len = atob[0] * atob[0] + atob[1] * atob[1];
    let dot = atop[0] * atob[0] + atop[1] * atob[1];
    let t = Math.min( 1, Math.max( 0, dot / len ) );

    dot = ( b[0] - a[0] ) * ( p[y_index] - a[y_index] ) - ( b[y_index] - a[y_index] ) * ( p[0] - a[0] );
	if( y_index === 2 )
		return [a[0] + atob[0] * t, 0, a[2] + atob[1] * t ];
    return [a[0] + atob[0] * t, a[1] + atob[1] * t ];
}

if(typeof(window) == "undefined")
{
	module.exports = WalkArea;
}