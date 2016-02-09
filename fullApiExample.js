$('selector').SbmFreeDrag({
		lock: 'j_locked j_blocked',//[voluntary] list off classNames, separated with whitespaces, that rejects starting of drag
		scope: 'parent',//[voluntary] scope of dragging element nesting. could be DOMelement reference, JQ reference, string value 'parent'
		leaveScope: 'y',//[voluntary] way of leaving scope 'x' || 'y' || 'x,y'
		sortable: 'x',//[voluntary] way of sorting elements 'x' || 'y' 
		overcrossing: 5,//[voluntary] 5px overcrossing before replacement happens
		sensitivity: 5,//[voluntary] 5px precision before dag will start, less then 5 px cursor delta ignores
		sourceCopy: true,//[voluntary] if true- source doesnt replaces with cursor, but creates its clone
		onReachingScope: function(el, p){},//[voluntary] "el" is sourceElement, "p" is dataParameter
		onReachScope: function(el, p){},//[voluntary] "el" is sourceElement, "p" is dataParameter
		onLeavingScope: function(el, p){},//[voluntary] "el" is sourceElement, "p" is dataParameter
		onLeaveScope: function(el, p){},//[voluntary] "el" is sourceElement, "p" is dataParameter
		onDragStart: function(el, p){},//[voluntary] "el" is sourceElement, "p" is dataParameter
		onDragEnd: function(){el, p}//[voluntary] "el" is sourceElement, "p" is dataParameter
	});
// also here is ability to change scope of dragged element (for example when you are starting drag in one sortable scope and finish dragging in another sortable scope)
$('selector').SbmFreeDrag({
		onDragStart: function(node){
			$(window).trigger('setDragScope',{
				scope: $('div[data-rel=' + $(node).data('rel') + ']'),//[required]
				nsrc: document.createElement('div'),//[voluntary]
				maxChildren: 6,//[voluntary]
				insert: true,//[voluntary]
				center: true,//[voluntary]
				sortable: 'y',//[voluntary]
				dragMod: function(el){},//[voluntary]
				srcMod: function(src, drag){},//[voluntary] 
				srcPasted: function(src){}//[voluntary] 
			});
		}, 
		onDragEnd: function(el,p){
			$(window).trigger('removeDragScope');//on development stage
		}
	});