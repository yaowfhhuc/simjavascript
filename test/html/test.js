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
	
	btn.on("mouseover", function(){
		alert("hey, you over me...");
	});
	
	Sim.ref.build({
		cType:"Div",
		className:"mainDiv",
		id:"mDiv",
		parent:SimUI.fetch("mDiv"),
		children:[
		    {
		    	cType:"Div",
		    	children:[
		    	    {
		    	    	cType:"Label",
		    	    	innerText:"ID",
		    	    	className:"un-label"
		    	    },
		    	    {
		    	    	cType:"TextField",
		    	    	name:"username",
		    	    	id:"username",
		    	    	className:"un-text"
		    	    }
		    	]
		    },
		    {
		    	cType:"Div",
		    	children:[
					{
						cType:"Label",
						innerText:"pwd",
						className:"pwd-label"
					},
					{
						cType:"PasswordField",
						name:"password",
						id:"password",
						className:"pwd-text"
					}
		    	]
		    },
		    {
		    	cType:"Div",
		    	children:[
		    	    {
		    	    	cType:"Button",
		    	    	value:"login",
		    	    	click:"alert('login')"
		    	    },
		    	    {
		    	    	cType:"Button",
		    	    	value:"cancel",
		    	    	click:function(){
		    	    		alert("cancel");
		    	    	}
		    	    }
		    	]
		    }
		]
	});
	
	var x = {
		"key1":1,
		"key2":2.5,
		"key3":"test",
		"key4":new Date(),
		"key5":[1,2,3],
		"key6":undefined,
		"key7":{
			k11:"test",
			k23:"val"
		}
	};
	
	alert(SimUtil.asJson(x));
});