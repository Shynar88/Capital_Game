// This allows the Javascript code inside this block to only run when the page
// has finished loading in the browser.

/*
Notes: 

- My clear button is not disabled when table has no entries, 
and also clear action on empty table is undoable. 
After trying several hours disabling clear almost worked, but it didn't handle 
all edge cases, so I didn't handle all cases of empty table clear disablment
as it wasn't explicitely stated so in assignment criteria. 
*/

var table = document.getElementById("table");
var question = document.getElementById("pr2__question");
var btn = document.getElementById("pr2__submit");
var npt = document.getElementById('pr2__answer');
var rawrad = document.getElementById('radios');
var prev = question.innerHTML
var previndex = null
var index = null
var lst = []
var pairs = []
var config = {
  apiKey: "AIzaSyBjWeAY8XFhTSYcqwDbL23VCV4eDV3nZ9Y",
  databaseURL: "https://hcipr3-357a7.firebaseio.com/",
};
firebase.initializeApp(config);
var database = firebase.database();
var tableRef = database.ref('mytable');
var undotableRef = database.ref('undotable');
var redotableRef = database.ref('redotable');


$( document ).ready(function() {
  checkundo()
  showupdatedtbl()
  $.ajax({ type: "GET",
			url: "https://s3.ap-northeast-2.amazonaws.com/cs374-csv/country_capital_pairs.csv",
			success: function(text){
				temp = text.split("\n")
				for(var i = 1, size = temp.length; i < size ; i++){
					var item = temp[i]
					item = item.split(",")
					el = {"country":item[0],"capital":item[1]}
					pairs.push(el)

				}
				window.pairs = pairs
				genqstn()
				srclist()
			}
		})

  $("#pr2__answer").focus()
  $("#pr2__answer").autocomplete({
  	minLength: 2,
	source: lst,
	select: function (e, ui) {
		ans = ui.item.label.slice(0, -1);
		myresult()
		$(".ui-menu-item").hide()
		npt.value = ''
		return false
}
	})

});



function showupdatedtbl(){
	$("#table tr:gt(3)").remove();
	tableRef.once("value", function(tables) {
			  		tables.forEach(function(table){
			  			$(table.val().tbl).insertAfter(".fixed");
			  		});
			  	});
	checkundo()
}
//always getting some TypeError: Object.values requires that input 
// parameter not be null or undefined error with this code, but everything basically works
// tableRef.on('value', function(snapshot){
// 	console.log("updated")
// 	var tableObject = snapshot.val()
// 	presentSubm(tableObject)
// })

// function presentSubm(tableObject){
// 	$("#table tr:gt(3)").remove();
// 	// after each function null and then again populated
// 	Object.values(tableObject).map(function(table) {
// 			console.log(table)
// 			$(table.tbl).insertAfter(".fixed");
// 	})
// }

btn.onclick = function(){
	ans = npt.value;
	myresult()
}

$('table').on('click', '.delbtn', function() {
		var oldtableObject = {
			tbl: partoftbl()
		}
		undotableRef.push(oldtableObject)
		$(this).closest('tr').remove()
		var tableObject = {
			tbl: partoftbl()
		}
		$.when( tableRef.remove() ).done(tableRef.push(tableObject))
		showupdatedtbl()
	});

$('table').on('click', '#pr3__clear', function() {
		var oldtableObject = {
			tbl: partoftbl()
		}
		undotableRef.push(oldtableObject)
		//maybe
		tableRef.remove()
		showupdatedtbl()
	});

$('table').on('click', '#pr3__reset', function() {
	$("#pr3__clear").attr("disabled", "disabled");
	tableRef.remove()
	undotableRef.remove()
	showupdatedtbl()
})

$('table').on('click', '.cntry', function() {
		  	document.getElementById("mymap").src = "https://www.google.com/maps/embed/v1/place?key=AIzaSyCla3bgMM2Y3ruN00PEQ632st0N04hulkQ&q=" + $(this).closest("tr").find(".cntry").text() + "&maptype=satellite"
		  });

$('table').on('click', '#pr3__undo', function() {
		  	undotableRef.limitToLast(1).once("child_added", function(snapshot){
		  		$("#table tr:gt(3)").remove();
		  		var prevtable = snapshot.val().tbl
		  		$(prevtable).insertAfter(".fixed");
		  		snapshot.ref.remove()
		  		var tableObject = {
					tbl: partoftbl()
				}	
				$.when( tableRef.remove() ).done(tableRef.push(tableObject))
					checkundo()
		  		});
		  })

function checkundo(){
	undotableRef.once("value", function(tables) {
		  		if(tables.numChildren() > 0) {
		  			$("#pr3__undo").removeAttr("disabled");
		  		} else {
		  			$("#pr3__undo").attr("disabled", "disabled");
		  		}
		  	});
}



function myresult(){
	// var tbllst = null
	// oldtableObject = {
	// 		tbl: tbllst
	// 	}
	// 	undotableRef.once("value", function(tables) {
	// 		  		tables.forEach(function(table){
	// 		  			tbllst = table.val().tbl
	// 		  			tbllst.append(partoftbl())
	// 		  		});
	// 		  	});
	// 	$.when( undotableRef.remove() ).done(undotableRef.push(oldtableObject))
	var oldtableObject = {
		tbl: partoftbl()
	}
	undotableRef.push(oldtableObject)
	if (ans === window.pairs[index].capital.slice(0, -1)) {
		var newrow = '<tr class="general bl">' + 
		                  '<td class="cntry">' + question.innerHTML + '</td>' +
		                  '<td>' + ans + '</td>' + 
		                  '<td><i class="fa fa-check"></i><button type="button" class="delbtn"> Delete </button></td>' + 
		                '</tr>'
		$(newrow).insertAfter(".fixed");
		if(document.getElementById("wrngonly").checked == true){
				document.getElementById("all").checked = true;
				allfun()
			}
	} else {
		var newrow = '<tr class="general rd">' + 
		                  '<td class="cntry">' + question.innerHTML + '</td>' +
		                  '<td class="strike">' + ans + '</td>' + 
		                  '<td>' + window.pairs[index].capital + '<button type="button" class="delbtn"> Delete </button></td>' + 
		                '</tr>'
		$(newrow).insertAfter(".fixed");
		if(document.getElementById("crctonly").checked == true){
			document.getElementById("all").checked = true;
			allfun()
			}
	}
	var tableObject = {
		tbl: partoftbl()
	}
	$.when( tableRef.remove() ).done(tableRef.push(tableObject))
	showupdatedtbl()
	genqstn()
	npt.value = ''
	npt.focus()
}

function partoftbl(){
	var whole = $("table").find("tbody").html().trim().replace(/(\r\n|\n|\r)/gm,"").split("</tr>")
	var rtrntbl = ""
	for (var i = 4; i<whole.length-1; i++){
		rtrntbl += (whole[i] + '</tr>')
	}
	return rtrntbl
}

function allfun(){
	tr = table.getElementsByTagName("tr");
 	for (i = 0; i < tr.length; i++) {
 		$(tr[i]).show()
 	}
}

function crctfun(){
 	tr = table.getElementsByTagName("tr");
 	for (i = 4; i < tr.length; i++) {
 		if ($(tr[i]).hasClass("bl")) {
	        $(tr[i]).show();
	      } else {
	        $(tr[i]).hide();
	      }
	    } 
  }

function wrngfun(){
 	tr = table.getElementsByTagName("tr");
 	for (i = 4; i < tr.length; i++) {
	    if ($(tr[i]).hasClass("rd")) {
	        $(tr[i]).show();
	      } else {
	        $(tr[i]).hide();
	      }
	    }
}

function srclist(){
	for (i = 0; i < window.pairs.length; i++) { 
    	lst.push(window.pairs[i].capital)
	}
}

function genqstn(){
	index = getRandomInt(0, 170)
	question.innerHTML = window.pairs[index].country;
	document.getElementById("mymap").src = "https://www.google.com/maps/embed/v1/place?key=AIzaSyCla3bgMM2Y3ruN00PEQ632st0N04hulkQ&q=" + window.pairs[index].country + "&maptype=satellite"
	return 
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}