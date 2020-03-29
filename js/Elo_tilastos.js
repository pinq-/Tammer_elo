var save_json = [];
$( document ).ready(function() {
  get_json();
  var Player_result_table = $('#Player_info').DataTable( {
        paging: false,
        searching: false,
        "info": false,
        "order": [[ 1, "desc" ]],
        "columns": [
            { data: "Name", defaultContent: 0 },
            { data: "Elo", defaultContent: 0 },
            { data: "Oka", defaultContent: 0 },
            { data: "win", defaultContent: 0 },
            { data: "los", defaultContent: 0 },
            { data: "even", defaultContent: 0 },
        ]
  });
  $('#Player_info tbody').on( 'click', 'tr', function () {
    pelaaja_id =$(this).closest('tr').children('td:first').text();
    piirra_hka_kayra(pelaaja_id);
    if (!$("#Hka_div").hasClass("show")) {
      $('#Hka_div').collapse('show');
    };
  });

});


function get_json(){
   $.getJSON("https://kukko.kapsi.fi/matches.json", function (data) {
     parse_player_data(data);
   });
};

function parse_player_data(data){
  var stats = {};
  start_points = 0;
  // console.log(data.length);
  $("#games_n").text(data.length);
  $.each(data, function(i,val){
    // console.log(val.player1);
    if(start_points == 0){
      start_points = (val.elo1 + val.elo2)/2;
    }
    date = new Date(val.input_date);
    date.setMinutes(date.getMinutes() - 30);
    date = date.getTime();
    if(typeof stats[val.player1] === 'undefined'){
      stats[val.player1] = {tulokset: [], Elo_kehitys:[start_points], pelin_aika: [date], Elo_nyt:start_points, Voitot:0, Haviot:0, Tasa:0}
    };
    if(typeof stats[val.player2] === 'undefined'){
      stats[val.player2] = {tulokset: [], Elo_kehitys:[start_points], pelin_aika: [date], Elo_nyt:start_points, Voitot:0, Haviot:0, Tasa:0}
    };
    date = new Date(val.input_date).getTime();
    stats[val.player1].tulokset.push(val.score1);
    stats[val.player1].Elo_kehitys.push(Number((val.elo1).toFixed(1)));
    stats[val.player1].Elo_nyt = Number((val.elo1).toFixed(1));
    stats[val.player2].tulokset.push(val.score2);
    stats[val.player2].Elo_kehitys.push(Number((val.elo2).toFixed(1)));
    stats[val.player2].Elo_nyt = Number((val.elo2).toFixed(1));
    stats[val.player1].pelin_aika.push(date);
    stats[val.player2].pelin_aika.push(date);
    if(val.score1 > val.score2){
      stats[val.player1].Voitot ++;
      stats[val.player2].Haviot ++;
    }
    else if (val.score1 < val.score2){
      stats[val.player2].Voitot ++;
      stats[val.player1].Haviot ++;
    }
    else{
      stats[val.player2].Tasa ++;
      stats[val.player1].Tasa ++;
    };
  });
  $.each(stats, function(i, val){
    val.Elo_kehitys.push(val.Elo_kehitys[val.Elo_kehitys.length -1]);
    val.pelin_aika.push(new Date().getTime());
  });
  piirra_elo_kayra(stats);
  fill_table(stats);
  save_json = stats;
  // console.log(stats);
}

function piirra_elo_kayra(data){
    objects = [];
    $.each(data, function(i,val){
      // console.log(i,val.Elo_kehitys);
      elo_points = val.pelin_aika.map((item,index) => {return [item,val.Elo_kehitys[index]]})
      objects.push({name:i, data:elo_points});
    });
    // console.log(objects)
  Highcharts.chart('Elo_pisteet', {
      title:{
          text:"",
      },
      credits:{enabled:false},

      yAxis: {
          title: {
              text: "elo-pisteet"
          }
      },
      legend: {
                enabled : ($(window).width() > 768)
      },

      xAxis: {
        // tickInterval: 1,
        type: 'datetime',
        title: {
            text: "pelien määrä"
        },
        labels: {
  format: '{value:%d.%m.%Y}',
}
      },
      series: objects,

          plotOptions: {
              series: {
                  marker: {
                      enabled: false
                  }
              }
            }

  });
};

function piirra_hka_kayra(name){
    // var pelin_aika = save_json[name].pelin_aika.slice();
    // pelin_aika.pop();
    // pelin_aika.shift();
    // elo_points = pelin_aika.map((item,index) => {return [item,save_json[name].tulokset[index]]});
    // console.log(elo_points);
  Highcharts.chart('Hka_pisteet', {
      title:{
          text:"",
      },
      credits:{enabled:false},

      yAxis: {
          title: {
              text: "Hka-pisteet"
          }
      },
      legend: {
                enabled : ($(window).width() > 768)
      },

      xAxis: {
        tickInterval: 1,
//         type: 'datetime',
//         title: {
//             text: "pelien määrä"
//         },
//         labels: {
//   format: '{value:%d.%m.%Y}',
// }
      },
      series:[{data: save_json[name].tulokset, name:name}],

          plotOptions: {
              series: {
                  marker: {
                      enabled: false
                  }
              }
            }

  });
};

function fill_table(data){
  // console.log(data);
  objects = [];
  table= $('#Player_info').DataTable();
  $.each(data,function(i,val){
    oka_sum = val.tulokset.reduce((a,b) => a + b, 0);
    objects.push({Name:i, Elo:val.Elo_nyt, Oka:Number((oka_sum/val.tulokset.length).toFixed(2)), win:val.Voitot, los: val.Haviot, even:val.Tasa});
  });
  // console.log(objects);
  table.clear();
  table.rows.add(objects).draw();
};
