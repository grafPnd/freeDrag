$(function(){
	$('.j_handler').click(function(){
		if($(this).hasClass('iconRight')){
			expand($(this));
		}else{
			collapse($(this));
		}
	});
	function expand(el){
		el
		.removeClass('iconRight').addClass('iconDown')
		.parents('.j_group').find('.j_subgroup').removeClass('s_hidden');
	};
	function collapse(el){
		el
		.removeClass('iconDown').addClass('iconRight')
		.parents('.j_group').find('.j_subgroup').addClass('s_hidden');
	}
  
  
	$('.j_trayItem').SbmFreeDrag({
		sourceCopy: true,
		leaveScope: 'x,y',// 'x' || 'y' || 'x,y'
		onDragStart: function(node){
			console.log('draging has been started',node); 
			var
				rel = $(node).data('rel'),
				target = $('.j_handler').eq(rel);
			expand(target);
			$(window).trigger('setDragScope',{
				scope: target.parents('.j_listItem').find('.j_subgroup')[0]
			});
			target.parents('.j_listItem').find('.j_subgroup').addClass('highlightedBlock');
		}, 
		onLeaveScope: function(source, dragEl){
			console.log('element has left scope',source);
		},
		onReachScope: function(source, dragEl){// drag element over destination container
			console.log('el has reached destination', source)
		},
		onDragEnd: function(node){// drop element
			console.log('draging has been ended',node);
			var
				rel = $(node).data('rel'),
				target = $('.j_handler').eq(rel);
			collapse(target);
			$(window).trigger('removeDragScope');
			target.parents('.j_listItem').find('.j_subgroup').removeClass('highlightedBlock');
		}
	}); 
	$('.j_listItem').SbmFreeDrag({
		scope: 'parent',
		sortable: 'y',// 'x' || 'y' || 'x,y'
		overcrossing: 5,// 5px overcrossing before replacement happens
		sensitivity: 5,// 5px precision before dag will start, less then 5 px cursor delta ignores
		onDragStart: function(node){
			// console.log('draging has been started',node);
		},
		onDragEnd: function(node){//drop element
			// console.log('draging has been ended',node);
		}
	});
	$('.j_SubListItem').SbmFreeDrag({
		scope: 'parent',
		leaveScope: 'x',// 'x' || 'y' || 'x,y'
		sortable: 'y',// 'x' || 'y' || 'x,y'
		onLeaveScope: function(source, dragEl){
			console.log('element has left scope',source);
		},
		onReachScope: function(source, dragEl){
			console.log('element has reached scope',source);
		}
	});
});