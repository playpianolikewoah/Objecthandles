(function(){
	var root = this;
	var ObjectHandles;

	// The top-level namespace. All public ObjectHandles classes and modules will
	// be attached to this. Exported for both the browser and the server.
	var ObjectHandles;
	if (typeof exports !== 'undefined') {
		ObjectHandles = exports;
	} else {
		ObjectHandles = root.ObjectHandles = {};
	}

	// Current version of the library. Keep in sync with `package.json`.
	ObjectHandles.VERSION = '0.0.1';

	var Point = function(x,y){
		if(!x) x = 0;
		if(!y) y = 0;
		var distance = function(point){
			return 7
		}()
		return {
			x:x,
			y:y,
			distance:distance
		}
	}

	var Matrix = function(){

		return {}
	}

	var DragGeometry = function(){
		return {}
	}

	var zero = Point(0,0);

	var handles = {};
	var models = {};
	/**
	* These are the handles that appear around the bounding box when multiple objects are selected.
	**/
	var multiSelectHandles = [];
                
	// Key = a Model, value = an Array of handles
	var handles = {}; 
        
	// Key = a visual, value = the model
	var models = {};
        
	// Key = a model, value = an array of constraints for that model.
	var constraints = {};
        
	// A dictionary of the geometry of the models before the current drag operation started.                
	// This is set at the beginning of the user gesture.
	// Key = a visual, value = the model
	var originalModelGeometry = {}; 

	// Key = a model, value = the visual
	var visuals = {};
        
	// Key = a model, value = an array of HandleDescription objects;
	var handleDefinitions = {}; 
        
	// Array of unused, visible=false handles
	var handleCache = [];
        
	var temp = Point();
	var tempMatrix = Matrix();
        
	var isDragging = false;
                
	var currentDragRole = 0;
                
	var mouseDownPoint = Point();
	var containerMouseDownPoint = Point();
	var mouseDownRotation = 0;

	ObjectHandles.Point = Point;


}).call(this)