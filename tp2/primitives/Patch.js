function Patch(scene,orderU, orderV, partsU, partsV,controlPoints){

    this.scene = scene;
    this.orderU = orderU;
    this.orderV = orderV;
    this.controlP = controlPoints;

    SurfFunc = this.makeFunc(orderU, orderV, this.getControlPoints());

    CGFnurbsObject.call(this, scene, SurfFunc, partsU, partsV);
};

Patch.prototype = Object.create(CGFnurbsObject.prototype);
Patch.prototype.constructor = Patch;

Patch.prototype.makeFunc = function(degree1, degree2, controlVerts){

    var knots1 = this.getKnotsVector(degree1);
    var knots2 = this.getKnotsVector(degree2);

    var nurbsSurface = new CGFnurbsSurface(degree1, degree2, knots1, knots2, controlVerts);
    
    return function(u, v) { return nurbsSurface.getPoint(u, v);};
};

Patch.prototype.getKnotsVector = function(deg) {
    
    var v = new Array();

    for (var i=0; i<=deg; i++) {
        v.push(0);
    }

    for (var i=0; i<=deg; i++) {
        v.push(1);
    }
    
    return v;
};

Patch.prototype.getControlPoints = function() {
    
    var res = new Array();
    
    for(var u = 0; u <= this.orderU; u++){
        var controlVerts = new Array();
        for(var v = 0; v <= this.orderV; v++){
            var i = v + u * (this.orderV + 1);
            controlVerts.push([this.controlP[i][0],this.controlP[i][1],this.controlP[i][2],1]);
        }
        res.push(controlVerts);
    }
    
    return res;
};