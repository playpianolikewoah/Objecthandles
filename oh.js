(function(){
	var root = this;

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

	var HandleRoles = function(){
		var RESIZE_UP = 1;
		var RESIZE_DOWN = 2;
		var RESIZE_LEFT = 4;
		var RESIZE_RIGHT = 8;
		var ROTATE = 16;
		var MOVE = 32;

		var isResize = function(val){
			return isResizeDown(val) || isResizeLeft(val) || isResizeRight(val) || isResizeUp(val);
		};
		var isResizeUp = function(val){
			return (val & RESIZE_UP) == RESIZE_UP;
		};
		var isResizeDown = function(val){
			return (val & RESIZE_DOWN) == RESIZE_DOWN;
		};
		var isResizeLeft = function(val){
			return (val & RESIZE_LEFT) == RESIZE_LEFT;
		};
		var isResizeRight = function(val){
			return (val & RESIZE_RIGHT) == RESIZE_RIGHT;
		};
		var isRotate = function(val){
			return (val & ROTATE) == ROTATE;
		};
		var isMove = function(val){
			return (val & MOVE) == MOVE;
		};

		return {
			RESIZE_UP:RESIZE_UP,
			RESIZE_DOWN:RESIZE_DOWN,
			RESIZE_LEFT:RESIZE_LEFT,
			RESIZE_RIGHT:RESIZE_RIGHT,
			ROTATE:ROTATE,
			MOVE:MOVE,
			isResize:isResize,
			isResizeUp:isResizeUp,
			isResizeDown:isResizeDown,
			isResizeLeft:isResizeLeft,
			isResizeRight,isResizeRight,
			isRotate:isRotate,
			isMove:isMove
		}
	}

	var HandleDescription = function(role,percentageOffset,offset,handleFactory,constraint){
		var role = 				typeof role !== 'undefined' ? role : 0;
		var percentageOffset = 	typeof percentageOffset !== 'undefined' ? percentageOffset : Point();
		var offset = 			typeof offset !== 'undefined' ? offset : Point();
		var handleFactory = 	typeof handleFactory !== 'undefined' ? handleFactory : null;
		var constraint = 		typeof constraint !== 'undefined' ? constraint : null;

		return {
			role:role,
			percentageOffset:percentageOffset,
			offset:offset,
			handleFactory:handleFactory,
			constraint:constraint
		}
	}

	var SelectionManager = function(){
		var currentlySelected = [];
		var addToSelected = function(model){
			if(currentlySelected.indexOf(model) != -1){return} //already selected
			if(currentlySelected.length > 0){
				var locked = isSelectionLocked();
				if(model.hasOwnProperty("isLocked")){
					if(locked && !model.isLocked){return}
					if(!locked && model.isLocked){return}
				}
			}

			currentlySelected.push(model);
			var evt = 'SelectionEvent:ADDED_TO_SELECTION'
			$(this).trigger(evt);
		}

		var removeFromSelection = function(model){
			var ind:int = currentlySelected.indexOf(model);
			if( ind == -1 ) { return; }

			currentlySelected.splice(ind,1);

			var evt = 'SelectionEvent:REMOVED_FROM_SELECTION';
			$(this).trigger(evt);
		}

		var clearSelection = function(){
			var evt 'SelectionEvent.SELECTION_CLEARED';
			currentlySelected = [];
			$(this).trigger(evt);   
		}

		var isSelectionLocked = function(){
			var s = '';
			for(s in currentlySelected){
				var model = currentlySelected[s]
				if(model.hasOwnProperty('isLocked')){
					if(model.isLocked){
						return true;
					}
				}
			}
		}
		
		return {
			currentlySelected:currentlySelected,
			addToSelected:addToSelected,
			removeFromSelection:removeFromSelection,
			clearSelection:clearSelection
		}
	}

	var Matrix = function(){
		return {}
	}

	var Rectangle = function(x,y,w,h){
		return {
			x:x,
			y:y,
			w:w,
			h:h
		}
	}

	var DragGeometry = function(x,y,w,h,r,locked){
		var rectangle = function(){
			return Rectangle(x,y,w,h)
		}
		return {
			x:x,
			y:y,
			w:w,
			h:h,
			locked:locked,
			rectangle:rectangle
		}
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

	ObjectHandles.init = function($container){
		if(!$container){
			// throw "Need a container"
			throw "Missing $container."
		}
		ObjectHandles.$container = $container;
		ObjectHandles.selectionManager = SelectionManager();
		ObjectHandles.selectionManager.addToSelected({shape:'circle'});
		ObjectHandles.selectionManager.on('SelectionEvent:ADDED_TO_SELECTION', onSelectionAdded);
		ObjectHandles.selectionManager.on('SelectionEvent:REMOVED_FROM_SELECTION', onSelectionRemoved);
		ObjectHandles.selectionManager.on('SelectionEvent:SELECTION_CLEARED', onSelectionCleared);

		multiSelectHandles.push()
	}

	var onSelectionAdded = function(){
		setupHandles();
	}

	var onSelectionRemoved = function(){
		setupHandles();
	}

	var onSelectionCleared = function(){
		setupHandles();
		lastSelectedModel = null;
	}


}).call(this)