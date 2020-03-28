$( document ).ready(function() {
  get_json();
  var Player_result_table = $('#Player_info').DataTable( {
        paging: false,
        searching: false,
        "info": false,
        "columns": [
            { data: "Name", defaultContent: 0 },
            { data: "Elo", defaultContent: 0 },
            { data: "Oka", defaultContent: 0 },
            { data: "win", defaultContent: 0 },
            { data: "los", defaultContent: 0 },
            { data: "even", defaultContent: 0 },
        ]
  });
});


function get_json(){
   $.getJSON("https://kukko.kapsi.fi/matches.json", function (data) {
     // console.log(data);
     parse_player_data(data);
   })

};

function parse_player_data(data){
  var stats = {};
  // console.log(data.length);
  $("#games_n").text(data.length);
  $.each(data, function(i,val){
    // console.log(val.player1);
    if(typeof stats[val.player1] === 'undefined'){
      stats[val.player1] = {tulokset: [], Elo_kehitys:[1600], Elo_nyt:1600, Voitot:0, Haviot:0, Tasa:0}
    };
    if(typeof stats[val.player2] === 'undefined'){
      stats[val.player2] = {tulokset: [], Elo_kehitys:[1600], Elo_nyt:1600, Voitot:0, Haviot:0, Tasa:0}
    };
    stats[val.player1].tulokset.push(val.score1);
    stats[val.player1].Elo_kehitys.push(Number((val.elo1).toFixed(2)));
    stats[val.player1].Elo_nyt = Number((val.elo1).toFixed(2));
    stats[val.player2].tulokset.push(val.score2);
    stats[val.player2].Elo_kehitys.push(Number((val.elo2).toFixed(2)));
    stats[val.player2].Elo_nyt = Number((val.elo2).toFixed(2));
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
  piirra_elo_kayra(stats);
  fill_table(stats);
  // console.log(stats);
}

function piirra_elo_kayra(data){
    objects = [];
    $.each(data, function(i,val){
      // console.log(i,val.Elo_kehitys);
      objects.push({name:i, data:val.Elo_kehitys});
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

      xAxis: {
        tickInterval: 1,
        title: {
            text: "pelien määrä"
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

function fill_table(data){
  objects = [];
  table= $('#Player_info').DataTable();
  $.each(data,function(i,val){
    oka_sum = val.tulokset.reduce((a,b) => a + b, 0);
    objects.push({Name:i, Elo:val.Elo_nyt, Oka:Number((oka_sum/val.tulokset.length).toFixed(2)), win:val.Voitot, los: val.Haviot, even:val.Tasa});
  });
  console.log(objects);
  table.clear();
  table.rows.add(objects).draw();
};
