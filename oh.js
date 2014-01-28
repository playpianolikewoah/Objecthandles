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

	Object.defineProperty(Object.prototype, "__uniqueId", {
		writable: true
	});
	Object.defineProperty(Object.prototype, "uniqueId", {
		get: function() {
		if (this.__uniqueId == undefined)
			this.__uniqueId = guid();
		return this.__uniqueId;
	}
	});
	
	var guid = function() {
		var S4 = function() {
			return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
		};

		return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	}

	// Current version of the library. Keep in sync with `package.json`.
	ObjectHandles.VERSION = '0.0.1';

	if (!Object.prototype.watch) {
		Object.defineProperty(Object.prototype, "watch", {
			  enumerable: false
			, configurable: true
			, writable: false
			, value: function (prop, handler) {
				var
				  oldval = this[prop]
				, newval = oldval
				, getter = function () {
					return newval;
				}
				, setter = function (val) {
					oldval = newval;
					return newval = handler.call(this, prop, oldval, val);
				}
				;
				
				if (delete this[prop]) { // can't watch constants
					Object.defineProperty(this, prop, {
						  get: getter
						, set: setter
						, enumerable: true
						, configurable: true
					});
				}
			}
		});
	}
	 
	// object.unwatch
	if (!Object.prototype.unwatch) {
		Object.defineProperty(Object.prototype, "unwatch", {
			  enumerable: false
			, configurable: true
			, writable: false
			, value: function (prop) {
				var val = this[prop];
				delete this[prop]; // remove accessors
				this[prop] = val;
			}
		});
	}

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
			isResizeRight:isResizeRight,
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
			var ind = currentlySelected.indexOf(model);
			if( ind == -1 ) { return; }

			currentlySelected.splice(ind,1);

			var evt = 'SelectionEvent:REMOVED_FROM_SELECTION';
			$(this).trigger(evt);
		}

		var clearSelection = function(){
			var evt = 'SelectionEvent.SELECTION_CLEARED';
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
		x = 		typeof x !== 'undefined' ? x : 0;
		y = 		typeof y !== 'undefined' ? y : 0;
		w = 		typeof w !== 'undefined' ? w : 0;
		h = 		typeof h !== 'undefined' ? h : 0;
		r =		 	typeof r !== 'undefined' ? r : 0;
		locked = 	typeof locked !== 'undefined' ? locked : 0;
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

	var zero = Point();

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

	ObjectHandles.modelList = [];
        
	// A dictionary of the geometry of the models before the current drag operation started.                
	// This is set at the beginning of the user gesture.
	// Key = a visual, value = the model
	var originalModelGeometry = {}; 

	// Key = a model, value = the visual
	var visuals = {};
        
	// Key = a model, value = an array of HandleDescription objects;
	var handleDefinitions = {}; 

	var defaultHandles = [];
        
	// Array of unused, visible=false handles
	var handleCache = [];
        
	var temp = Point();
	var tempMatrix = Matrix();
        
	var isDragging = false;
                
	var currentDragRole = 0;
                
	var mouseDownPoint = Point();
	var containerMouseDownPoint = Point();
	var mouseDownRotation = 0;

	var multiSelectModel = DragGeometry();

	ObjectHandles.Point = Point;

	ObjectHandles.container;

	ObjectHandles.init = function(container){
		if(!container){
			// throw "Need a container"
			throw "Missing container."
		}

		ObjectHandles.SVG = SVG(container);
		// var rect = ObjectHandles.SVG.rect(50,50).move(100,100).fill('#f09');

		ObjectHandles.$container = $("#" + container);
		ObjectHandles.selectionManager = SelectionManager();
		ObjectHandles.selectionManager.addToSelected({shape:'circle'});
		$(ObjectHandles.selectionManager).on('SelectionEvent:ADDED_TO_SELECTION', onSelectionAdded);
		$(ObjectHandles.selectionManager).on('SelectionEvent:REMOVED_FROM_SELECTION', onSelectionRemoved);
		$(ObjectHandles.selectionManager).on('SelectionEvent:SELECTION_CLEARED', onSelectionCleared);

		multiSelectHandles.push(HandleDescription(HandleRoles.RESIZE_UP + HandleRoles.RESIZE_LEFT,
			zero,
			zero));
		multiSelectHandles.push(HandleDescription(HandleRoles.RESIZE_UP,
			Point(50,0),
			zero));
		multiSelectHandles.push(HandleDescription(HandleRoles.RESIZE_UP + HandleRoles.RESIZE_RIGHT,
			Point(100,0),
			zero));
		multiSelectHandles.push(HandleDescription(HandleRoles.RESIZE_UP + HandleRoles.RESIZE_RIGHT,
			Point(100,50),
			zero));
		multiSelectHandles.push(HandleDescription(HandleRoles.RESIZE_DOWN + HandleRoles.RESIZE_RIGHT,
			Point(100,100),
			zero));
		multiSelectHandles.push(HandleDescription(HandleRoles.RESIZE_DOWN,
			Point(50,100),
			zero));
		multiSelectHandles.push(HandleDescription(HandleRoles.RESIZE_DOWN + HandleRoles.RESIZE_LEFT,
			Point(0,100),
			zero));
		multiSelectHandles.push(HandleDescription(HandleRoles.RESIZE_LEFT,
			Point(0,50),
			zero));
		multiSelectHandles.push(HandleDescription(HandleRoles.ROTATE,
			Point(100,50),
			Point(20,0)));

		defaultHandles.push(HandleDescription(HandleRoles.RESIZE_UP + HandleRoles.RESIZE_LEFT,
			zero,
			zero));
		defaultHandles.push(HandleDescription(HandleRoles.RESIZE_UP,
			Point(50,0),
			zero));
		defaultHandles.push(HandleDescription(HandleRoles.RESIZE_UP + HandleRoles.RESIZE_RIGHT,
			Point(100,0),
			zero));
		defaultHandles.push(HandleDescription(HandleRoles.RESIZE_UP + HandleRoles.RESIZE_RIGHT,
			Point(100,50),
			zero));
		defaultHandles.push(HandleDescription(HandleRoles.RESIZE_DOWN + HandleRoles.RESIZE_RIGHT,
			Point(100,100),
			zero));
		defaultHandles.push(HandleDescription(HandleRoles.RESIZE_DOWN,
			Point(50,100),
			zero));
		defaultHandles.push(HandleDescription(HandleRoles.RESIZE_DOWN + HandleRoles.RESIZE_LEFT,
			Point(0,100),
			zero));
		defaultHandles.push(HandleDescription(HandleRoles.RESIZE_LEFT,
			Point(0,50),
			zero));
		defaultHandles.push(HandleDescription(HandleRoles.ROTATE,
			Point(100,50),
			Point(20,0)));


		registerComponent(multiSelectModel, null, multiSelectHandles, false);
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

	var registerComponent = function(dataModel,
		visualDisplay,
		handleDescriptions,
		captureKeyEvents,
		customConstraints
		){
		handleDescriptions = 	typeof handleDescriptions !== 'undefined' ? handleDescriptions : null;
		captureKeyEvents = 		typeof captureKeyEvents !== 'undefined' ? captureKeyEvents : true;
		customConstraints = 	typeof customConstraints !== 'undefined' ? customConstraints : null;

		ObjectHandles.modelList.push(dataModel);
		if(visualDisplay){
			visualDisplay.on('mousedown',onComponentMouseDown);
			$(visualDisplay).on('SelectionEvent:SELECTED',handleSelection);
			if(captureKeyEvents){
				$(visualDisplay).on('KeyboardEvent:KEY_DOWN',onKeyDown);
			}
			models[visualDisplay.uniqueId] = dataModel;
		}
		var s = '';
		for(s in dataModel){
			dataModel.watch(s,onModelChange);
		}

		visuals[dataModel] = visualDisplay;

		if(handleDescriptions){
			handleDefinitions[dataModel.uniqueId] = handleDescriptions;
		}
		if(customConstraints){
			constraints[dataModel.uniqueId] = customConstraints;
		}
	}

	var onModelChange = function(prop){
		if(prop == 'x' || prop == 'y' || 'width' == )
	}

	var onComponentMouseDown = function(){

	}

	var handleSelection = function(){

	}

	var onkeyDown = function(){

	}


}).call(this)