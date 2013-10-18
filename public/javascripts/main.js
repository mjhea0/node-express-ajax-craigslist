$(function(){
  $('#search').on('keyup', function(e){
  if(e.keyCode === 13) {
    var val = $(this).val()

    $.ajax({
      type: 'GET',
      url: '/searching',
      data: {search: val},
      dataType: 'json',
      success: function(data) {
        console.log(data)
        $('#results').html(data);
      }
    })
  }
  })
})