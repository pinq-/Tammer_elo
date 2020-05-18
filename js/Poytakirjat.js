$( document ).ready(function() {
  $('input').val('');
  var mvar = 0, mvalue= 0, cell;
$( ".achange, .bchange, .change" ).change(function() {
  mvar = 0;
  zeros = 0;
  cell = this.className.split(" ")[0];
  $("." + cell).each(function() {
      mvar += Number($(this).val());
    });
  $("#" + cell[0] + "zeros").text(zeros)
  $("#" +cell).attr("value", mvar);
  update_all(cell[0])
  });

});

function update_all(round){
  var zeros = 0, emptys = 0, pappi = 0, save_points;
  save_points = 20 - $("#" + round + "fir").attr("value");
  $("#" + round + "fir").text(save_points);
  save_points = save_points - $("#" + round + "sec").attr("value");
  $("#" + round + "sec").text(save_points);
  save_points = save_points - $("#" + round + "thi").attr("value");
  $("#" + round + "thi").text(save_points);
  save_points = save_points - $("#" + round + "fou").attr("value");
  $("#" + round + "fou").text(save_points);
  save_points = save_points - $("#" + round + "fif").attr("value");
  $("#" + round + "fif").text(save_points);
  $("#" + round + "akat").text(save_points);

  $("." + round + "change").each(function() {
      if ($(this).val() == "0"){
        zeros += 1;
      }
      if (!$(this).val()){
        emptys += 1;
      }
    });
    $("#" + round + "zeros").text(zeros)
    if(save_points != 0){
      pappi = Number($("." + round + "papi").val());
    }else{
      pappi = 0;
    }
    $("#" + round + "resu").text(emptys - save_points*2 - pappi);
    result = Number($("#aresu").text()) + Number($("#bresu").text());
    $("#result").text(result);
    age_help = Number($("#age_help").val());
    $("#end_result").text(result + age_help);
    $("#all_zeros").text(Number($("#azeros").text()) + Number($("#bzeros").text()));

}
