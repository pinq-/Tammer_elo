var save_json = [];
$( document ).ready(function() {
  get_json();
  // $.fn.dataTable.moment( 'HH:mm MMM D, YY' );
  // localStorage.getItem('theme');
  // localStorage.setItem('theme', 'dark'); //add this
  var Player_result_table = $('#Player_info').DataTable( {
        paging: false,
        searching: false,
        "info": false,
        "order": [[ 1, "desc" ]],
        "columns": [
            { data: "Name", defaultContent: 0 },
            { data: "Elo", defaultContent: 0 },
            { data: "Oka", defaultContent: 0 },
            { data: "N", defaultContent: 0 },
            { data: "win", defaultContent: 0 },
            { data: "los", defaultContent: 0 },
            { data: "even", defaultContent: 0 },
        ]
  });
  $('#new_games').DataTable( {
        paging: false,
        searching: false,
        "info": false,
        "order": [[ 0, "desc" ]],
        "columns": [
            { data: "input_date_s"},
            { data: "elo1_delta", defaultContent: 0 },
            { data: "player1", defaultContent: 0 },
            { data: "score1", defaultContent: 0 },
            { data: "score2", defaultContent: 0 },
            { data: "player2", defaultContent: 0 },
        ],
        columnDefs: [ {
              targets: 0,
              render: $.fn.dataTable.render.moment( 'YYYYMMDD','HH:mm DD.MM' )
            } ],
  });
  $('#all_games_table').DataTable( {
        paging: false,
        "info": false,
        "order": [[ 0, "desc" ]],
        "columns": [
            { data: "input_date_s", defaultContent: 0 },
            { data: "elo1_delta", defaultContent: 0 },
            { data: "player1", defaultContent: 0 },
            { data: "score1", defaultContent: 0 },
            { data: "score2", defaultContent: 0 },
            { data: "player2", defaultContent: 0 },
        ],
        columnDefs: [ {
              targets: 0,
              render: $.fn.dataTable.render.moment( 'YYYYMMDD','HH:mm DD.MM' )
            }],
  });
  $('#Player_info tbody').on( 'click', 'tr', function () {
    pelaaja_id =$(this).closest('tr').children('td:first').text();
    piirra_hka_kayra(pelaaja_id);
    if (!$("#Hka_div").hasClass("show")) {
      $('#Hka_div').collapse('show');
    };
  });

  $('#dark-mode').on( 'click', function () {
    dark_mode();
    Highcharts.chart('Elo_pisteet').xAxis[0].setExtremes(Date.UTC(2020, 4, 8), Date.UTC(2020, 5, 10));
  });
  // const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;
  // if(currentTheme){
  //   if (currentTheme === 'dark') {
  //     dark_mode();
  //   }
  // }

});


function get_json(){
   $.getJSON("https://kukko.kapsi.fi/matches.json", function (data) {
     parse_player_data(data);
   });
};

function parse_player_data(data){
  var new_games = $('#new_games').DataTable();
  var all_games = $('#all_games_table').DataTable();
  var stats = {};
  var start_points = 0;
  var peli_kerrat = {};
  var date;
  $("#games_n").text(data.length);
  $.each(data, function(i,val){
    player_key1 = val.player1 + "_" + val.player2;
    player_key2 = val.player2 + "_" + val.player1;
    // console.log(i);
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
    val.input_date_s =  new Date(val.input_date);
    val.elo1_delta = Math.abs(Number((val.elo1 - stats[val.player1].Elo_nyt).toFixed(1)));
    if ( i > data.length-4){
      new_games.rows.add([val]).draw();
    }
    all_games.rows.add([val]).draw();
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
    if(player_key1 in peli_kerrat){
      peli_kerrat[player_key1].pelit ++;
    }
    else if(player_key2 in peli_kerrat){
      peli_kerrat[player_key2].pelit ++;
    }else{
      peli_kerrat[player_key1] = {pelit:1};
    }

  });
  var today = new Date().getTime();
  $.each(stats, function(i, val){
    val.Elo_kehitys.push(val.Elo_kehitys[val.Elo_kehitys.length -1]);
    val.pelin_aika.push(today);
  });
  piirra_elo_kayra(stats);
  fill_table(stats);
  piirra_yhteydet(peli_kerrat);
  piirra_hka_kayra("");
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
  Highcharts.stockChart('Elo_pisteet', {
    colors: ['#6600cc', '#66ff33', '#2b908f','#ff0066',
  '#eeaaee', '#55BF3B', '#DF5353', '#7798BF', '#aaeeee', '#ff0000', '#0066ff', '#009933', "#ff9900"],
      title:{
          text:"",
      },
      rangeSelector: {
        inputEnabled: true,
        buttonTheme: {
            visibility: 'hidden'
        },
        labelStyle: {
            visibility: 'hidden'
        }
    },
      chart: {
          zoomType: '',
          panning: true,
          panKey: 'shift',
          events: {
                  load: function() {
                      var chart = this,
                      series = this.series[0],
                      xAxis = chart.xAxis[0],
                      newStart = series.xData[series.xData.length -2],
                      newEnd = series.xData[series.xData.length -1];
                      // console.log(series.xData);
                    xAxis.setExtremes(newStart, newEnd);
                  }
                }
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
          tickInterval: 86400000,
          type: 'datetime',
          title: {
              text: "pelien aika"
          },
          labels: {
            format: '{value:%d.%m.%Y}',
            enabled : ($(window).width() > 768),
          }
      },
      series: objects,

      plotOptions: {
          series: {
              marker: {
                  enabled: true
              },
              step: true,
          }
      },
      tooltip: {
        shared: true,
      },

  });
};

function piirra_hka_kayra(name){
  var data;
  if(name == ""){
    data = [];
  }
  else{
    data = save_json[name].tulokset;
  }
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
      },
      series:[{data: data, name:name}],

          plotOptions: {
              series: {
                  marker: {
                      enabled: false
                  }
              }
            }

  });
  if ($("#content-wrapper").hasClass("bg-dark")) {
    $("#Hka_pisteet .highcharts-background").toggleClass('bg-card-dark');
    $("#Hka_pisteet text").toggleClass('text-gray-100');
  }
};

function piirra_yhteydet(data){
    objects = [];
    var pelaajat;
    $.each(data, function(i,val){
      // console.log(i.split("_"),val);
      pelaajat = i.split("_");
      pelaajat.push(val.pelit);
      // console.log(pelaajat);
      objects.push(pelaajat);
    });
    // console.log(objects);
    Highcharts.chart('peli_kerrat', {
      colors: ['#6600cc', '#66ff33', '#2b908f', '#ff0066',
    '#eeaaee', '#55BF3B', '#DF5353', '#7798BF', '#aaeeee', '#ff0000', '#0066ff', '#009933', "#ff9900"],

        title: {
            text: ''
        },
        credits:{enabled:false},

        accessibility: {
            point: {
                valueDescriptionFormat: '{index}. From {point.from} to {point.to}: {point.weight}.'
            }
        },

        series: [{
            keys: ['from', 'to', 'weight'],
            data: objects,
            type: 'dependencywheel',
            name: "",
            dataLabels: {
                color: '#333',
                textPath: {
                    enabled: false,
                    attributes: {
                        dy: 5
                    }
                },
                distance: 10
            },
            size: '95%'
        }]

    });
};

function fill_table(data){
  // console.log(data);
  var player_n = {Name:"-", n:0};
  var player_elo = {Name:"-", elo:0}, elo_d = 0;
  var objects = [], games_n = 0;
  var table= $('#Player_info').DataTable();
  $.each(data,function(i,val){
    elo_d = 0;
    // console.log(i, val);
    $.each(val.Elo_kehitys, function(i,val_elo){
      if(i == (val.Elo_kehitys.length - 1)){
        return false;
      }
      elo_d += val.Elo_kehitys[i+1] - val_elo;
    });
    elo_d = Number((elo_d / (val.Elo_kehitys.length -2)).toFixed(2));
    // console.log(elo_d);
    oka_sum = val.tulokset.reduce((a,b) => a + b, 0);
    games_n = val.Voitot + val.Haviot + val.Tasa;
    objects.push({Name:i, Elo:val.Elo_nyt, Oka:Number((oka_sum/val.tulokset.length).toFixed(2)),N:games_n, win:val.Voitot, los: val.Haviot, even:val.Tasa});
    if(player_n.n < games_n){
      player_n.n = games_n;
      player_n.Name = i;
    }
    if(player_elo.elo < elo_d){
      player_elo.elo = elo_d;
      player_elo.Name = i;
    }
  });
  $("#player_n").text(player_n.Name + " (" + player_n.n + ")");
  $("#elo_player").text(player_elo.Name + " (" + player_elo.elo + " pistettä/peli)");
  table.clear();
  table.rows.add(objects).draw();
};

function dark_mode(){
  $("#content-wrapper").toggleClass('bg-dark');
  $(".card-body").toggleClass('bg-card-dark');
  $(".card").toggleClass('bg-card-dark');
  $(".card-header").toggleClass('card-header-dark');
  $(".h5").toggleClass('text-gray-100');
  $(".h5").toggleClass('text-gray-800');
  $(".h3").toggleClass('text-gray-100');
  $(".h3").toggleClass('text-gray-800');
  $(".sidebar-brand-text").toggleClass('text-gray-900');
  $(".sidebar-brand-icon").toggleClass('text-gray-900');
  $(".nav-link").toggleClass('text-gray-900');
  $(".fas").toggleClass('text-gray-900');
  $(".table").toggleClass('table-dark');
  $(".highcharts-background").toggleClass('bg-card-dark');
  $(".highcharts-text-outline").toggleClass('text-dark-stroke');
  $("text").toggleClass('text-gray-100');
  $("#dark-mode").toggleClass('btn-dark');
  $("#dark-mode").toggleClass('btn-light');
  $(".modal-content").toggleClass('bg-dark');
  if($("#dark-mode").text() == "Dark mode"){
    $("#dark-mode").text("White mode")
  }else{
    $("#dark-mode").text("Dark mode")

  }
};
