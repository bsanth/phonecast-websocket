// $(function(){
// 	function onComplete(data){
// 		var time = Date.now();
// 		var diffImage = new Image();
// 		diffImage.src = data.getImageDataUrl();

// 		$('#image-diff').html(diffImage);

// 		$(diffImage).click(function(){
// 			window.open(diffImage.src, '_blank');
// 		});

// 		$('.buttons').show();

// 		if(data.misMatchPercentage == 0){
// 			$('#thesame').show();
// 			$('#diff-results').hide();
// 		} else {
// 			$('#mismatch').text(data.misMatchPercentage);
// 			if(!data.isSameDimensions){
// 				$('#differentdimensions').show();
// 			} else {
// 				$('#differentdimensions').hide();
// 			}
// 			$('#diff-results').show();
// 			$('#thesame').hide();
// 		}
// 	}
//   resemble('screen.jpeg').compareTo('screen2.jpeg').onComplete(onComplete);
// });
