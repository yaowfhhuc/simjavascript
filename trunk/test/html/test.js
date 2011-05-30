SimUtil.include("a.js");
SimUtil.include("b.js");

SimUtil.onload(function(){
	/*SimUtil.on($("btn"), "click", function(){
		alert(2);
	});*/
	
	//thread test
	Sim.$("btn1").bind("click", function(){
		new Thread().regFunc(function(){
			setTimeout("alert(12)", 1000);
		}).start();
		
		new Thread().regFunc(function(){
			alert(13);
		}).start();
		
		new Thread(function(){
			alert(15);
		}).start();
		
	});
	
	//list test
	SimUtil.on(Sim.$("btn2"), "click", function(){
		var list = new List();
		list.add("a");
		list.add("b");
		list.add("a");
		list.insert("c", 1);
		
		alert(list.contains("b"));
		
		for(var x = 0; x < list.size(); x ++){
			alert(x + " : " + list.get(x));
		}
		
		alert(list);
	});
	
	//map test
	SimUtil.on(Sim.$("btn3"), "click", function(){
		var map = new Map();
		map.put("a", "a1");
		map.put("b", "b1");
		map.put("a", "asdf");
		
		alert(map.containsValue("b"));
		
		for(var x in map.entries()){
			alert(x + " : " + map.entries()[x]);
		}
		
		alert(map);
	});
	
	//set test
	SimUtil.on(Sim.$("btn4"), "click", function(){
		var set = new Set();
		set.add("a");
		set.add("b");
		set.add("a");
		
		alert(set.contains("b"));
		
		for(var x in set.entries()){
			alert(x + " : " + set.entries()[x]);
		}
		
		alert(set);
	});
	
	//HashMap test
	SimUtil.on(Sim.$("btn5"), "click", function(){
		var map = new HashMap();
		map.put("a", "a1");
		map.put("b", "b");
		map.put("da", "asdf");
		map.put("a", "asdf");
		
		alert(map.containsValue("b"));
		
		for(var item = map.iterator(); item; item = item.nextItem()){
			alert(item.key + " : " + item.value);
		}
		
		alert(map);
	});
	
	//HashSet test
	SimUtil.on(Sim.$("btn6"), "click", function(){
		var set = new HashSet();
		set.add("a");
		set.add("b");
		set.add("a");
		
		alert(set.contains("b"));
		
		for(var item = set.iterator(); item; item = item.nextItem()){
			alert(item.value);
		}
		
		alert(set);
	});
	
	var test = function(){
		
		alert(1);
		
		Sim.$("btn7").unbind("click");
	}
	Sim.$("btn7").bind("click", test);
	
	Sim.$("btn8").bind("click", function(){
		Sim.$("btn7").bind("click", "alert('haha')");
	});
	
	Sim.$("btn9").bind("click", function(){
		Sim.$("btn7").unbind();
	});
	
	var btn = new Button("abc", "abc", "hello");
	
	SimUtil.config(btn, {
		click:function(){
			alert("OK");
		}
	});
	
	document.body.appendChild(btn.element());
	
	Sim.ref.build({
		cType:"Div",
		children:[
          {
			cType:"IButton",
			value:"ibtn",
			click:function(){
        	  	alert("this is ibutton");
          	}
		},{
			cType:"RadioButton",
			value:"radiovalue",
			click:function(){
        	  	alert("this is radio");
          	}
		},{
			cType:"Label",
			innerText:"hello, this is a label",
			title:"hehe!"
		},{
			cType:"TextField",
			value:"this is the default value"
		}],
		parent:document.body
	});
	
});