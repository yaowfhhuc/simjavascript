/*!
 * JavaScript Sim Framework V1.0
 * http://code.google.com/p/simjavascript/
 *
 * Copyright 2010, Peyton Peng
 * licensed under the LGPL version 3 license.
 * http://www.gnu.org/licenses/lgpl.html
 *
 * Date: Sat Sep 11 12:52:12 2010 +0800
 */

var Sim = {
	Auther : "Peyton Peng",
	Email: "smtd5@126.com",
	version : "0.9"
};

Object.prototype.evalJSON = function(){
	return eval("(" + this + ")");
}

var SimUtil = {
	inList : false,
	includingReady:false,
	ID_SET:false,
	genID : function(){
		var id = "" + Math.random();
		
		id = id.substring(2);
		if(!SimUtil.ID_SET){
			SimUtil.ID_SET = new HashSet();
		}
		if(SimUtil.ID_SET.contains(id)){
			return SimUtil.genID();
		}
		
		SimUtil.ID_SET.add(id);
		return id;
	},
	on : function(idE, method, func) {
		if (window.ActiveXObject) {
			if(false && window.ActiveXObject){
				idE.setAttribute("on" + method, function() {
					if (typeof (func) == "function") {
						new func();
					} else {
						eval(func);
					}
				});
			}else{
				idE["on" + method] = function() {
					if (typeof (func) == "function") {
						new func();
					} else {
						eval(func);
					}
				};
			}
		} else {
			try {
				var newFunc = function() {
					if (typeof (func) == "function") {
						new func();
					} else {
						eval(func);
					}
				}
				idE.addEventListener(method, newFunc, false);
			} catch (e) {
			}
		}
	},
	onload : function(func) {
		
		if (document.addEventListener) {
			document.addEventListener("DOMContentLoaded", function() {
				document.removeEventListener("DOMContentLoaded", arguments.callee, false);
				SimUtil.includingReady = true;
				}, false);
		} else {
			document.onreadystatechange = function() {
				if (this.readyState == "complete") {
					SimUtil.includingReady = true;
					document.onreadystatechange=null
				}
			}
		}
		
		$_loop_1 = function() {
			if (!document.body || !SimUtil.includingReady) {
				SimUtil.onload(func);
				return false;
			}

			SimUtil.delegate(function(){
				if (typeof (func) == "function") {
					new func();
				} else {
					eval(func);
				}
			})
		};
		setTimeout("$_loop_1()", 50);
	},
	include : function(url) {
		SimUtil.flag = false;
		var e = document.createElement("script");
		e.setAttribute("type", "text/javascript");
		e.setAttribute("src", url);
		if (!this.inList) {
			this.inList = [];
		}
		this.inList[this.inList.length] = e;
		
		try{
			// need to refine, insert into head
			document.firstChild.nextSibling.firstChild.appendChild(e);
			
			
		}catch(e){}
	},
	initInclude : function() {
		$_loop_2 = function() {
			if (!document.body) {
				setTimeout("$_loop_2()", 50);
				return false;
			}
			
			if(SimUtil.inList){
				for ( var i = 0; i < SimUtil.inList.length; i++) {
					// document.body.appendChild(SimUtil.inList[i]);
				}
			}
			
			SimUtil.includingReady = true;
		}
		setTimeout("$_loop_2()", 50);
	}(),
	extend : function(parent, child) {
		if ((null != parent) && (typeof (child) == "function")) {
			for ( var key in parent) {
				if ((!child[key]) && (key != "cType")) {
					child.prototype[key] = parent[key];
				}
			}
			if (child != String) {
				child.prototype["toString"] = parent.toString;
			}
			child.prototype.parent = parent;
		}
	},
	config : function(elem, cObj) {
		if ((null != elem) && (typeof (cObj) == "object")) {
			for ( var key in cObj) {
				elem[key] = cObj[key];
			}
		}
		
		return elem;
	},
	hash : function(s) {
		var h = 0, off = 0;
		var len = s.length;
		for ( var i = 0; i < len; i++) {
			h = 31 * h + s.charCodeAt(off++);
		}
		while (h > 2147483647) {
			h %= 429567296;
		}
		return h;
	},
	delegate: function(func, time){
		time = time || 1;
		return setTimeout(function(){
			if (typeof (func) == "function") {
				new func();
			} else {
				eval(func);
			}
			
		}, time)
	}
};

Sim.Ajax = function(cObj){
	var xmlHttpRequest = false;
	try{ 　　
		if( window.ActiveXObject ){ 　　
			for( var i = 5; i; i-- ){ 　　
				try{ 　　
					if( i == 2 ){ 　　
						xmlHttpRequest = new ActiveXObject( "Microsoft.XMLHTTP" ); } 　　
					else{ 　　
						xmlHttpRequest = new ActiveXObject( "Msxml2.XMLHTTP." + i + ".0" ); 　　
						
						xmlHttpRequest.setRequestHeader("Content-Type","application/x-www-form-urlencoded"); 　　
						xmlHttpRequest.setRequestHeader("Charset","UTF-8");
					} 　　
					break;
				}catch(e){ 　　
					xmlHttpRequest = false; 
				} 
			} 
		} else if( window.XMLHttpRequest ) { 
			xmlHttpRequest = new XMLHttpRequest(); 　　
			if (xmlHttpRequest.overrideMimeType) { 
				xmlHttpRequest.overrideMimeType('application/x-www-form-urlencoded'); 
			} 
		} 
	}  catch(e){ 
		xmlHttpRequest = false; 
	}
	
	var params = null;
	var getParams = null;
	if(cObj.params){
		params = "";
		for(var x in cObj.params){
			params += ("&"+x+"="+cObj.params[x]);
		}
		
		params = params.substring(1);
	}
	
	if(!cObj.nocache){
		
		if(params){
			params += "&token="+new Date();
		}else{
			params = "token="+new Date();
		}
	}
	
	if(params && !cObj.method || cObj.method == "GET"){
		if(cObj.url.indexOf("?")){
			getParams = "?" + params;
		}else{
			getParams = "&" + params;
		}
		params = null;
	}
	
	xmlHttpRequest.open(cObj.method || "GET", cObj.url + getParams, cObj.async || true);
	xmlHttpRequest.send(params); 
	
	if(cObj.success || cObj.error){
		xmlHttpRequest.onreadystatechange = function(){
			
			if(xmlHttpRequest.readyState == 4){
				if(xmlHttpRequest.status == 200){
					cObj.success.call(this, xmlHttpRequest.responseText);
				}else{
					if(cObj.error){
						cObj.error.call(this, xmlHttpRequest.responseText);
					}
				}
			}
		};
	}
}

/**
 * Class Object, super class of all classes in sim Public args: id, name,
 * parent, hashcode Note: we don't suggest directly reference the hashcode
 * field. You can get the value by invoking hashCode() method
 */
var Obj = function(i, n) {
	Obj.prototype.cType = "Object";
	this.parent = undefined;
	this.name = n;
	this.id = i;

	Obj.prototype.hashCode = function() {
		return SimUtil.hash(this.toString());
	}

	Obj.prototype.equals = function(o) {
		var result = false;

		if (o != null) {
			result = (this == o)
					|| (o.hashCode && (this.hashCode() == o.hashCode()));
		}

		return result;
	}

	Obj.prototype.toString = function() {
		return this.cType + " : " + this.id;
	}
};

var $_obj = new Obj();

SimUtil.extend($_obj, String);

var Thread = function(func){
	this.func = func;
	
	Thread.prototype.start = function(){
		SimUtil.delegate(this.func);
	}
}
SimUtil.extend($_obj, Thread);

// $(targetId)
var $ = function(id) {
	return document.getElementById(id);
};

var List = function() {
	List.prototype.cType = "List";
	this.hashcode = Math.random();
	this.array = [];
	this.length = 0;

	List.prototype.add = function(obj) {
		this.array[this.length++] = obj;
		return true;
	}

	List.prototype.insert = function(obj, index) {
		if (index < 0 || index > this.length) {
			return false;
		}

		for ( var i = this.length; i > index; i--) {
			this.array[i] = this.array[i - 1];
		}
		this.array[index] = obj;
		this.length++;
	}

	List.prototype.get = function(index) {
		if (index < 0 || index >= this.length) {
			return false;
		}
		return this.array[index];
	}

	List.prototype.remove = function(index) {
		if (typeof (index) == "number") {
			if (index < 0 || index >= this.length) {
				return false;
			}

			var reObj = array[index];
			for ( var i = index; i < this.length - 1; i++) {
				this.array[i] = this.array[i + 1];
			}
			this.array[this.length--] = null;
			return reObj;
		} else if (index.cType) {
			var reObj = false;
			for ( var i = 0; i < length - 1; i++) {
				if (index.equals(this.array[i])) {
					reObj = this.array[i];
					for (; i < this.length; i++) {
						this.array[i] = this.array[i + 1];
					}
					this.array[this.length--] = null;
					break;
				}
			}
			return reObj;
		} else {
			var reObj = false;
			for ( var i = 0; i < this.length - 1; i++) {
				if (index == array[i]) {
					reObj = array[i];
					for (; i < this.length; i++) {
						this.array[i] = this.array[i + 1];
					}
					this.array[this.length--] = null;
					break;
				}
			}
			return reObj;
		}
	}

	List.prototype.size = function() {
		return this.length;
	}

	List.prototype.contains = function(v) {
		var result = false;
		if (v && v.cType) {
			for ( var i = 0; i < this.length; i++) {
				if (v.equals(this.array[i])) {
					result = true;
					break;
				}
			}
		} else {
			for ( var i = 0; i < this.length; i++) {
				if (v = this.array[i]) {
					result = true;
					break;
				}
			}
		}

		return result;
	}
};

SimUtil.extend($_obj, List);
var $_list = new List();

var HashMap = function(tSize) {
	HashMap.prototype.cType = "HashMap";
	this.hashcode = Math.random();
	HashMap.prototype.DEFAULT_TABLE_SIZE = 7;
	this.tableSize = tSize;
	this.vSize = 0;
	if (!this.tableSize || this.tableSize < 7) {
		this.tableSize = this.DEFAULT_TABLE_SIZE;
	} else {
		while (true) {
			var sqrtV = Math.sqrt(this.tableSize);
			sqrtV = parseInt(sqrtV);
			var i = 2;
			for (; i < sqrtV; i++) {
				if (sqrtV % i == 0) {
					this.tableSize--;
					break;
				}
			}
			if (i == sqrtV) {
				break;
			}
		}
	}

	HashMap.prototype.Entry = function(k, v) {
		this.key = k;
		this.value = v;
		this.next = null;
		this.nextItem = function() {
			if (this.next && this.next.head) {
				return this.next.nextItem();
			} else {
				return this.next;
			}
		}
		this.isEnd = function() {
			if (!this.next || this.next.head) {
				return true;
			} else {
				return false;
			}
		}
	};

	HashMap.prototype.hashTable = [];

	this.hashTable[0] = new this.Entry();
	this.hashTable[0].head = true;
	for ( var i = 0; i < this.tableSize; i++) {
		this.hashTable[i + 1] = new this.Entry();
		this.hashTable[i + 1].head = true;
		this.hashTable[i].next = this.hashTable[i + 1];
	}

	HashMap.prototype.hash = function(v) {
		v *= 1000;
		v %= this.tableSize;
		return v;
	};

	HashMap.prototype.hashKey = function(key) {

		return (key && key.hashCode) ? this.hash(key.hashCode())
				: this.tableSize;
	};

	HashMap.prototype.put = function(k, v) {

		var index = this.hashKey(k);

		var item = this.hashTable[index];
		var result = null;

		while (!item.isEnd()) {
			item = item.next;

			if (item && (k == item.key) || (k.equals && k.equals(item.key))) {
				item.value = v;
				result = item;
				break;
			}
		}

		if (!result) {
			var elem = new this.Entry(k, v);
			elem.next = item.next;
			item.next = elem;
			this.vSize++;
		}

		return result;
	}

	HashMap.prototype.get = function(k) {

		var index = this.hashKey(k);

		var result = null;
		var item = this.hashTable[index];

		while (!item.isEnd()) {

			item = item.next;

			if (k == item.key || (k.equals && k.equals(item.key))) {
				result = item.value;
				break;
			}
		}

		return result;
	};

	HashMap.prototype.remove = function(k) {

		var index = this.hashKey(k);

		var result = false;
		var item = this.hashTable[index];

		while (!item.isEnd()) {
			if ((k.equals && k.equals(item.next.key)) || (k == item.next.key)) {
				result = item.next.value;
				this.vSize--;
				item.next = item.next.next;
				break;
			}
			item = item.next;
		}

		return result;
	}

	HashMap.prototype.contains = function(k) {

		var result = false;
		if (k != null) {
			var item = this.hashTable[0].nextItem();

			while (item) {
				if ((item.key == k) || (k.equals && k.equals(item.key))) {
					result = true;
					break;
				}
				item = item.nextItem();
			}
		}
		return result;
	}

	HashMap.prototype.containsValue = function(v) {

		var result = false;
		if (k != null) {
			var item = this.hashTable[0].nextItem();

			while (item) {
				if ((item.value == v) || (v.equals && v.equals(item.value))) {
					result = true;
					break;
				}
				item = item.nextItem();
			}
		}
		return result;
	}

	HashMap.prototype.iterator = function() {
		return this.hashTable[0].next;
	}

	HashMap.prototype.size = function() {
		return this.vSize;
	}
};
SimUtil.extend($_obj, HashMap);
var $_hashMap = new HashMap();

var HashSet = function(tSize) {
	HashSet.prototype.cType = "HashSet";
	this.hashcode = Math.random();
	HashSet.prototype.DEFAULT_TABLE_SIZE = 5;
	var container = new HashMap(tSize || this.DEFAULT_TABLE_SIZE);

	HashSet.prototype.add = function(v) {
		container.put(v, v);
	}

	HashSet.prototype.remove = function(v) {
		return container.remove(v);
	}

	HashSet.prototype.contains = function(v) {
		return container.contains(v);
	}

	HashSet.prototype.iterator = function() {
		return container.iterator();
	}

	HashSet.prototype.size = function() {
		return container.size();
	}
};
SimUtil.extend($_obj, HashSet);
var $_hashSet = new HashSet();


var Reflection = {
	CLASS_MAP : new HashMap(23),
	SUB_TYPE : "children",
	regClass : function(c){
		if(c && c.prototype.cType){
			Reflection.CLASS_MAP.put(c.prototype.cType, c);
		}else{
		   // skip now
		}
	},
	build : function(cObj){
		if(cObj && cObj.cType){
			var obj = new Reflection.CLASS_MAP.get(cObj.cType);
			for(var v in cObj){
			    var item = cObj[v];
			    if (v == Reflection.SUB_TYPE && item && item.length && obj.add) {
			    	for(var i = 0; i < item.length; i++){
			    		var child = Reflection.build(item[i]);
			    		if(child){
			    			obj.add(child);
			    		}
			    	}
			    }else{
			    	obj[v] = item;
			    }
			}
		}	
		  
		if(cObj.id){
		 	var code = "var " + cObj.id + " =false ; ";
		    if(window.ActiveXObject){
		    	window.execScript(code, "javascript");                         
		    }else{
		    	window.eval(code);
		    }
		    window[cObj.id] = obj;
		}  
		    return obj;
	}
} 

var SimUI = {
	fetch : function(id) {
		var e = $(id);
		var c = new Component(e.id, e.name);
		c.vElem = e;

		return c;
	},
	create : function(tagName) {
		var c = new Component();
		c.cType = tagName;
		return c;
	},
	clone : function(comp) {
		var c = new Component();
		c.cType = comp.cType;
		for (key in comp) {
			try {
				c[key] = comp[key];
			} catch (e) {}
		}
		
		return c;
	}
}

var Component = function(i, n) {
	Component.prototype.cType = "Component";
	this.hashcode = Math.random();
	this.id = i;
	this.name = n;
	this.vElem = null;

	Component.prototype.create = function() {
		var e = document.createElement(this.vType || this.cType);
		e.value = this.value;
		e.id = this.id || SimUtil.genID();
		try {
			for ( var x in this) {
				if (x == "click") {
					SimUtil.on(e, "click", this.click);
				} else if (x == "change") {
					SimUtil.on(e, "change", this.change);
				} else if (x == "mouseover") {
					SimUtil.on(e, "mouseover", this.mouseover);
				} else if (x == "mouseout") {
					SimUtil.on(e, "mouseout", this.mouseout);
				} else if (x == "dblclick") {
					SimUtil.on(e, "dblclick", this.dblclick);
				} else if (x == "blur") {
					SimUtil.on(e, "blur", this.blur);
				} else if (x == "focus") {
					SimUtil.on(e, "focus", this.focus);
				} else if (x == "load") {
					SimUtil.on(e, "load", this.load);
				} else if (x == "parent") {
					if (!this.parent) {
						// nothing
					} else if (!this.parent.cType) {
						try {
							this.parent.appendChild(e);
						} catch (e1) {
						}
					} else {
						try {
							this.parent.add(e);
						} catch (e2) {
						}
					}
				} else if (x == "value") {
					if (this.cType == "button") {
						e.innerText = this[x];
						e.textContent = this[x];
					}
				} else {
					if (x != "cType" && x != "vElem" && this[x]
							&& typeof (this[x]) != "function") {
						e[x] = this[x];
						try{
							e.setAttribute(x, this[x]);
						}catch(ex){}
					}

					if (x == "innerText") {
						e.innerText = this.innerText;
						e.textContent = this.innerText;
					}
				}
			}

		} catch (exc) {
			alert(exc.message);
			alert((this.vType || this.cType) + " don't support the type:" + x);
		}
		this.vElem = e;
		return e;
	};

	Component.prototype.add = function(elem) {
		if (!this.vElem) {
			this.create();
		}
		if (!elem.cType) {
			this.vElem.appendChild(elem);
		} else {
			if (!elem.vElem) {
				elem.create();
			}
			this.vElem.appendChild(elem.vElem);
		}
	};
	
	Component.prototype.setStyle = function(cName) {
		if (!this.vElem) {
			this.create();
		}
		if (this.vElem) {
			this.vElem.className = cName;
		}
	};
	
	Component.prototype.removeAll = function() {
		if (!this.vElem) {
			this.create();
		}
		if (this.vElem) {
			this.vElem.innerHTML = "";
		}
	};

	Component.prototype.setStyleValue = function(key, value) {
		if (!this.vElem) {
			this.create();
		}
		if (this.vElem) {
			try {
				this.vElem.style[key] = value;
			} catch (e) {
			}
		}
	};

	Component.prototype.setContent = function(content) {
		if (!this.vElem) {
			this.create();
		}
		try {
			this.vElem.innerText = content;
			this.vElem.textContent = content;
		} catch (exc) {
		}
	};
	
	Component.prototype.get = function(key){
		if (!this.vElem) {
			this.create();
		}
		try {
			return this.vElem[key]||this.vElem.getAttribute(key);
		} catch (exc) {
		}
	};
	
	Component.prototype.set = function(key, value){
		if (!this.vElem) {
			this.create();
		}
		try {
			this.vElem[key] = value;
			this.vElem.setAttribute(key, value);
		} catch (exc) {
		}
	};
	
};
SimUtil.extend($_obj, Component);
var $_component = new Component();

var Button = function(i, n, v) {
	Button.prototype.cType = "button";
	this.hashcode = Math.random();
	this.id = i;
	this.name = n;
	this.value = v;
	this.vElem = null;
	return this.vElem;
};

SimUtil.extend($_component, Button);

var Panel = function(i, v) {
	Panel.prototype.cType = "div";
	this.hashcode = Math.random();
	this.id = i;
	this.vElem = null;
	this.innerText = v;

	return this.vElem;
};
SimUtil.extend($_component, Panel);

var Label = function(i, v) {
	Label.prototype.cType = "span";
	this.hashcode = Math.random();
	this.id = i;
	this.vElem = null;
	this.innerText = v;

	return this.vElem;
};
SimUtil.extend($_component, Label);

var Option = function(i, n, v) {
	Option.prototype.cType = "option";
	this.hashcode = Math.random();
	this.id = i;
	this.name = n;
	this.value = v;
	this.vElem = null;
	return this.vElem;
};
SimUtil.extend($_component, Option);

var Select = function(i, n) {
	Select.prototype.cType = "select";
	this.hashcode = Math.random();
	this.id = i;
	this.name = n;
	this.vElem = null;
	return this.vElem;

	Select.prototype.add = function(elem) {
		if (!this.vElem) {
			this.create();
		}

		if (!elem.cType) {
			this.vElem.options.add(elem);
		} else {
			if (!elem.vElem) {
				elem.create();
			}
			this.vElem.options.add(elem.vElem);
		}
	};

	Select.prototype.remove = function(elem) {
		if (!this.vElem) {
			this.create();
		}

		if (!elem.cType) {
			this.vElem.options.remove(elem);
		} else {
			if (!elem.vElem) {
				elem.create();
			}
			this.vElem.options.remove(elem.vElem);
		}
	};
};
SimUtil.extend($_component, Select);

var Input = function() {
	Input.prototype.cType = "input";
	this.hashcode = Math.random();
	Input.prototype.create = function() {
		if (document.all) {
			var e = document.createElement("<input type=\"" + this.type
					+ "\" name=\"" + this.name + "\" />");
		} else {
			var e = document.createElement("input");
			e.type = this.type;
			e.name = this.name;
		}
		
		if(this.value){
			try {
				e.value = this.value;
			} catch (e) {
				e["value"] = this.value;
			}
		}
		
		e.id = this.id;
		try {
			for ( var x in this) {
				if (x == "click") {
					SimUtil.on(e, "click", this.click);
				} else if (x == "change") {
					SimUtil.on(e, "change", this.change);
				} else if (x == "mouseover") {
					SimUtil.on(e, "mouseover", this.mouseover);
				} else if (x == "mouseout") {
					SimUtil.on(e, "mouseout", this.mouseout);
				} else if (x == "dblclick") {
					SimUtil.on(e, "dblclick", this.dblclick);
				} else if (x == "blur") {
					SimUtil.on(e, "blur", this.blur);
				} else if (x == "focus") {
					SimUtil.on(e, "focus", this.focus);
				} else if (x == "load") {
					SimUtil.on(e, "load", this.load);
				} else if (x == "parent") {
					if (!this.parent.cType) {
						try {
							this.parent.appendChild(e);
						} catch (e1) {
						}
					} else {
						try {
							this.parent.add(e);
						} catch (e2) {
						}
					}
				} else {
					if (x == "type") {
						continue;
					}
					try {
						e[x] = this[x];
					} catch (e3) {
					}
				}
			}

		} catch (exc) {
			alert(exc.message);
			alert(this.cType + " don't support the type:" + x);
		}
		this.vElem = e;
		return e;
	}
}
SimUtil.extend($_component, Input);
var $_input = new Input();

var CheckBox = function(i, n, v) {
	CheckBox.prototype.cType = "input";
	CheckBox.prototype.type = "checkbox";
	this.hashcode = Math.random();
	this.id = i;
	this.name = n;
	this.value = v;
	this.vElem = null;
	return this.vElem;
};
SimUtil.extend($_input, CheckBox);

var Radio = function(i, n, v) {
	Radio.prototype.cType = "input";
	Radio.prototype.type = "radio";
	this.hashcode = Math.random();
	this.id = i;
	this.name = n;
	this.value = v;
	this.vElem = null;
	return this.vElem;
};
SimUtil.extend($_input, Radio);

var Submit = function(i, n, v) {
	Submit.prototype.cType = "input";
	TextField.prototype.type = "submit";
	this.hashcode = Math.random();
	this.id = i;
	this.name = n;
	this.value = v;
	this.vElem = null;
	return this.vElem;
};
SimUtil.extend($_input, Submit);

var Reset = function(i, n, v) {
	Reset.prototype.cType = "input";
	Reset.prototype.type = "reset";
	this.hashcode = Math.random();
	this.id = i;
	this.name = n;
	this.value = v;
	this.vElem = null;
	return this.vElem;
};
SimUtil.extend($_input, Reset);

var File = function(i, n, v) {
	File.prototype.cType = "input";
	File.prototype.type = "file";
	this.hashcode = Math.random();
	this.id = i;
	this.name = n;
	this.value = v;
	this.vElem = null;
	return this.vElem;
};
SimUtil.extend($_input, File);

var TextField = function(i, n, v) {
	TextField.prototype.cType = "input";
	TextField.prototype.type = "text";
	this.hashcode = Math.random();
	this.id = i;
	this.name = n;
	this.value = v;
	this.vElem = null;
	return this.vElem;
};
SimUtil.extend($_input, TextField);

var Password = function(i, n, v) {
	Password.prototype.cType = "input";
	Password.prototype.type = "password";
	this.hashcode = Math.random();
	this.id = i;
	this.name = n;
	this.value = v;
	this.vElem = null;
	return this.vElem;
};
SimUtil.extend($_input, Password);

var TextArea = function(i, n, v) {
	TextArea.prototype.cType = "textarea";
	this.hashcode = Math.random();
	this.id = i;
	this.name = n;
	this.value = v;
	this.vElem = null;
	return this.vElem;
};
SimUtil.extend($_component, TextArea);
