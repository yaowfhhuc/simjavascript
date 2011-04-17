/*!
 * JavaScript Sim Framework V1.0
 * http://code.google.com/p/simjavascript/
 *
 * Copyright 2010, Peyton Peng
 * licensed under the LGPL version 3 license.
 * http://www.gnu.org/licenses/lgpl.html
 *
 * Date: Sat Mar. 11 19:59:23 2011 +0800
 */

var Sim = {
	auther : "Peyton Peng",
	email : "smtd5@126.com",
	version : "1.0"
};

var SimUtil = {
	_cache : {
		srcs : 0,
		domReady : 0,
		count : 0
	},
	uniqueNum : function(){
		return new Date().getTime() + (SimUtil._cache.count++);
	},
	attachEvent: window.addEventListener ? 
			function(elem, type, func){
				if(elem.addEventListener){
					func = SimUtil.asFunc(func);
					elem.addEventListener(type, func, false);
					return func;
				}
			} :
			function(elem, type, func){
				if(elem.attachEvent){
					func = SimUtil.asFunc(func);
					elem.attachEvent("on" + type, func);
					return func;
				}
			},
	removeEvent: document.removeEventListener ?
		function(elem, type, func){
			if (elem.removeEventListener){
				elem.removeEventListener(type, func, false);
			}
		} :
		function(elem, type, func){
			if(elem.detachEvent){
				elem.detachEvent("on" + type, func);
			}
		},
	asFunc : function(func){
		return (typeof(func) == "function") ? func : function(){eval(func);};
	},
	onload : function(func){
		SimUtil.delegate(function(){
			if(!document.body || !SimUtil._cache.domReady || SimUtil._cache.srcs){
				SimUtil.onload(func);
			}else{
				SimUtil.delegate(func);
			}
		}, 10);
	},
	include : function(url){
		SimUtil._cache.srcs || (SimUtil._cache.srcs = {});
		if(!(url in SimUtil._cache.srcs)){
			SimUtil._cache.srcs[url] = "";
		}
	},
	extend : function(child, parent, flag){
		if(parent){
			for(var key in parent){
				if((!child[key]) && (key != "cType")){
					child.prototype[key] = parent[key];
				}
			}
			
			if(!flag){
				if(child != String){
					child.prototype["toString"] = parent.toString;
				}
				child.prototype.parent = parent;
			}
		}
	},
	config : function(elem, cObj){
		if((null != elem) && (typeof (cObj) == "object")){
			for(var key in cObj){
				elem[key] = cObj[key];
			}
		}
		return elem;
	},
	hash : function(s){
		s = "" + s;
		var h = 0, off = 0;
		var len = s.length;
		for(var i = 0; i < len; i++){
			h = 31 * h + s.charCodeAt(off++);
		}
		while(h > 2147483647){
			h %= 429567296;
		}
		return h;
	},
	delegate : function(func, time){
		time = time || 1;
		return setTimeout(func, time);
	}
};

SimUtil.on = SimUtil.attachEvent;

//initialize the event for dom ready
(function(){
	if(document.addEventListener){
		document.addEventListener("DOMContentLoaded", function(){
			document.removeEventListener("DOMContentLoaded", arguments.callee, false);
			SimUtil._cache.domReady = true;
			}, false);
	}else{
		document.onreadystatechange = function(){
			if (this.readyState == "complete"){
				SimUtil._cache.domReady = true;
				document.onreadystatechange=null
			}
		}
	}
	
	var _include = function(){
		if(!SimUtil._cache.domReady){
			SimUtil.delegate(_include, 10);
		}else{
			try{
				with(document.getElementsByTagName("head")[0]){
					for(var url in SimUtil._cache.srcs){
						var el = document.createElement("script");
						el.setAttribute("type", "text/javascript");
						el.setAttribute("src", url);
						appendChild(el);
					}
				}
				SimUtil._cache.srcs = null;
			}catch(e){}
		}
	};
	_include();
})();

Sim.Ajax = function(cObj){
	var xmlHttpRequest = false;
	try{
		if(window.ActiveXObject){
			for(var i = 5; i; i--){
				try{
					if(i == 2){
						xmlHttpRequest = new ActiveXObject("Microsoft.XMLHTTP");
					}else{
						xmlHttpRequest = new ActiveXObject( "Msxml2.XMLHTTP." + i + ".0" );
						xmlHttpRequest.setRequestHeader("Content-Type","application/x-www-form-urlencoded"); 　　
						xmlHttpRequest.setRequestHeader("Charset","UTF-8");
					}
					break;
				}catch(e){
					xmlHttpRequest = false;
				}
			}
		}else if(window.XMLHttpRequest){
			xmlHttpRequest = new XMLHttpRequest();
			if (xmlHttpRequest.overrideMimeType){
				xmlHttpRequest.overrideMimeType("application/x-www-form-urlencoded");
			}
		}
	}catch(e){
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

var ConstructorProvider = {
	construct : function(){
		var len = arguments.length;
		if(len)this.id = arguments[0];
		if(len > 1)this.name = arguments[1];
	}
}

/**
 * Class Object, super class of all classes in sim Public args: id, name,
 * parent, hashcode Note: we don't suggest directly reference the hashcode
 * field. You can get the value by invoking hashCode() method
 */
var Obj = function(){
	this.construct.apply(this, arguments);
};
{
	Obj.prototype.cType = "Object";
	SimUtil.extend(Obj, ConstructorProvider);

	Obj.prototype.hashCode = function(){
		return this.hashcode || SimUtil.hash(this.toString());
	}

	Obj.prototype.equals = function(o){
		return o && (this == o || (o.hashCode && (this.hashCode() == o.hashCode())));
	}

	Obj.prototype.toString = function(){
		return this.cType + (this.id ? (" : " + this.id) : "" ) + " [" + this.hashCode() + "]";
	}
}

var $_obj = new Obj();

SimUtil.extend(String, $_obj);
String.prototype.cType = "String";

var Thread = function(){
	if(arguments.length>2){
		this.func = arguments[2];
	}else if(arguments.length == 1 && (typeof arguments[0] == "function")){
		this.func = arguments[0];
	}
};
{
	Thread.prototype.cType = "Thread";
	Thread.prototype.start = function(){
		SimUtil.delegate(this.func);
	}

	Thread.prototype.regFunc = function(func){
		this.func = func;
		return this;
	}
}
SimUtil.extend(Thread, $_obj);

var List = function() {
	this.hashcode = SimUtil.uniqueNum();
	this.array = [];
	this.length = 0;
};
{
	List.prototype.cType = "List";
	List.prototype.add = function(obj){
		this.array[this.length++] = obj;
		return true;
	}

	List.prototype.insert = function(obj, index){
		if(index < 0 || index > this.length){
			return false;
		}

		for(var i = this.length; i > index; i--){
			this.array[i] = this.array[i - 1];
		}
		this.array[index] = obj;
		this.length++;
	}

	List.prototype.get = function(index){
		if (index < 0 || index >= this.length) {
			return false;
		}
		return this.array[index];
	}

	List.prototype.remove = function(o) {
		if (typeof(o) == "number") {
			if (o < 0 || o >= this.length) {
				return false;
			}

			var reObj = array[o];
			for(var i = o; i < this.length - 1; i++){
				this.array[i] = this.array[i + 1];
			}
			this.array[--this.length] = null;
			return reObj;
		}else{
			for(var i = 0; i < length - 1; i++){
				if((o.cType && o.equals(this.array[i])) || (o == this.array[i])){
					return this.remove(i);
				}
			}
			return false;
		}
	}

	List.prototype.size = function(){
		return this.length;
	}

	List.prototype.contains = function(v){
		for(var i = 0; i < this.length; i++){
			if((v == this.array[i]) || (v && v.cType && v.equals(this.array[i]))){
				return true;
			}
		}
		return false;
	}
}
SimUtil.extend(List, $_obj);
var $_list = new List();

var Map = function(){
	this._map = {};
	this.hashcode = SimUtil.uniqueNum();
	this.vSize++;
};
{
	Map.prototype.cType = "Map";
	
	Map.prototype.put = function(k, v){
		
		if(!(k in this._map)){
			this.vSize++;
		}
		
		this._map[k] = v;
		return v;
	}

	Map.prototype.get = function(k){
		return this._map[k];
	};

	Map.prototype.remove = function(k){

		var result = this._map[k];
		
		if(k in this._map){
			try{
				delete(this._map[k]);
			}catch(e){//to support IE7
				var mapCopy = {};
				for(var x in this._map){
					if(k != x)mapCopy[x] = this._map[x];
				}
				this._map = mapCopy;
			}
			this.vSize--;
		}
		return result;
	}

	Map.prototype.contains = function(k){
		return k in this._map;
	}

	Map.prototype.containsValue = function(v){
		var result = false;
		for(var x in this._map){
			if(result = (v == this._map[x]))break;
		}
		return result;
	}

	Map.prototype.entries = function(){
		return this._map;
	}

	Map.prototype.size = function(){
		return this.vSize;
	}
}
SimUtil.extend(Map, $_obj);
var $_map = new Map();

var Set = function(){
	this.hashcode = SimUtil.uniqueNum();
	this._container = new Map();
};
{
	Set.prototype.cType = "Set";
	
	Set.prototype.add = function(v){
		this._container.put(v, v);
	}

	Set.prototype.remove = function(v){
		return this._container.remove(v);
	}

	Set.prototype.contains = function(v){
		return this._container.contains(v);
	}

	Set.prototype.entries = function(){
		return this._container.entries();
	}

	Set.prototype.size = function(){
		return this._container.size();
	}
}
SimUtil.extend(Set, $_obj);
var $_set = new Set();

var HashMap = function(tSize){
	this.hashcode = SimUtil.uniqueNum();
	this._tableSize = tSize;
	this._vSize = 0;
	if(!this._tableSize || this._tableSize < this.DEFAULT_TABLE_SIZE){
		this._tableSize = this.DEFAULT_TABLE_SIZE;
	}else{
		while(true){
			var sqrtV = Math.sqrt(this._tableSize);
			sqrtV = parseInt(sqrtV);
			var i = 2;
			for(; i < sqrtV; i++){
				if(sqrtV % i == 0){
					this._tableSize--;
					break;
				}
			}
			if(i == sqrtV){
				break;
			}
		}
	}
	
	this._hashTable[0] = new this.Entry();
	this._hashTable[0].head = true;
	for(var i = 0; i < this._tableSize; i++){
		this._hashTable[i + 1] = new this.Entry();
		this._hashTable[i + 1].head = true;
		this._hashTable[i].next = this._hashTable[i + 1];
	}
};
{
	HashMap.prototype.cType = "HashMap";
	HashMap.prototype.DEFAULT_TABLE_SIZE = 7;
	HashMap.prototype._hashTable = [];
	HashMap.prototype.Entry = function(k, v){
		this.key = k;
		this.value = v;
		this.next = null;
		this.nextItem = function(){
			if(this.next && this.next.head){
				return this.next.nextItem();
			}else{
				return this.next;
			}
		}
		this.isEnd = function(){
			if(!this.next || this.next.head){
				return true;
			}else{
				return false;
			}
		}
	};

	HashMap.prototype.hash = function(v){
		v *= 1000;
		v %= this._tableSize;
		return v;
	};

	HashMap.prototype.hashKey = function(key){
		return (key && key.hashCode) ? this.hash(key.hashCode())
				: this._tableSize;
	};

	HashMap.prototype.put = function(k, v){

		var index = this.hashKey(k);

		var item = this._hashTable[index];
		var result = null;

		while(!item.isEnd()){
			item = item.next;

			if(item && (k == item.key) || (k.equals && k.equals(item.key))){
				item.value = v;
				result = item;
				break;
			}
		}

		if(!result){
			var elem = new this.Entry(k, v);
			elem.next = item.next;
			item.next = elem;
			this._vSize++;
		}

		return result;
	}

	HashMap.prototype.get = function(k){

		var index = this.hashKey(k);

		var result = null;
		var item = this._hashTable[index];

		while(!item.isEnd()){

			item = item.next;

			if(k == item.key || (k.equals && k.equals(item.key))){
				result = item.value;
				break;
			}
		}

		return result;
	};

	HashMap.prototype.remove = function(k){

		var index = this.hashKey(k);

		var result = false;
		var item = this._hashTable[index];

		while(!item.isEnd()){
			if((k.equals && k.equals(item.next.key)) || (k == item.next.key)){
				result = item.next.value;
				this._vSize--;
				item.next = item.next.next;
				break;
			}
			item = item.next;
		}

		return result;
	}

	HashMap.prototype.contains = function(k){

		var result = false;
		if(k != null){
			var item = this._hashTable[0].nextItem();

			while(item){
				if((item.key == k) || (k.equals && k.equals(item.key))){
					result = true;
					break;
				}
				item = item.nextItem();
			}
		}
		return result;
	}

	HashMap.prototype.containsValue = function(v){

		var result = false;
		if(v != null){
			var item = this._hashTable[0].nextItem();

			while(item){
				if((item.value == v) || (v.equals && v.equals(item.value))){
					result = true;
					break;
				}
				item = item.nextItem();
			}
		}
		return result;
	}

	HashMap.prototype.iterator = function(){
		return this._hashTable[0].next;
	}

	HashMap.prototype.size = function(){
		return this._vSize;
	}
};
SimUtil.extend(HashMap, $_obj);
var $_hashMap = new HashMap();

var HashSet = function(tSize){
	this.hashcode = SimUtil.uniqueNum();
	this._container = new HashMap(tSize || this.DEFAULT_TABLE_SIZE);
};
{
	HashSet.prototype.cType = "HashSet";
	HashSet.prototype.DEFAULT_TABLE_SIZE = 5;
	HashSet.prototype.add = function(v){
		this._container.put(v, v);
	}

	HashSet.prototype.remove = function(v){
		return this._container.remove(v);
	}

	HashSet.prototype.contains = function(v){
		return this._container.contains(v);
	}

	HashSet.prototype.iterator = function(){
		return this._container.iterator();
	}

	HashSet.prototype.size = function(){
		return this._container.size();
	}
};
SimUtil.extend(HashSet, $_obj);
var $_hashSet = new HashSet();

Sim.DomUtil = {
	funcs:[],
	bind : function(type, func){
		this.funcs[this.funcs.length] = {
				t:type,
				f:SimUtil.attachEvent(this, type, func)
		};
		return this;
	},
	unbind : function(type, func){
		var o;
		if(type){
			if(func){
				for(var i = this.funcs.length; i > 0 ; ){
					o = this.funcs[--i];
					if(o.t == type && o.f == func){
						SimUtil.removeEvent(this, type, func);
						this.funcs.splice(i, 1);
					}
				}
			}else{
				for(var i = this.funcs.length; i > 0 ; ){
					o = this.funcs[--i];
					if(o.t == type){
						this.unbind(o.t, o.f);
					}
				}
			}
		}else{
			for(var i = this.funcs.length; i > 0 ; ){
				o = this.funcs[--i];
				this.unbind(o.t, o.f);
			}
		}
		return this;
	}
};

SimUtil.querySelector = function(query){
	if(document.querySelectorAll){
		return document.querySelectorAll(query);
	}else{
		
	}
}

Sim.$ = function(id){
	var elem = false;
	elem = (id.cType == String.cType) ? document.getElementById(id) : id;
	
	if(elem){
		return SimUtil.config(elem, Sim.DomUtil);
	}else{
		return SimUtil.querySelector(id);
	}
};

Sim.ref = {
	CLASS_MAP : new HashMap(23),
	SUB_TYPE : "children",
	regClass : function(c){
		if(c && c.prototype.cType){
			Sim.ref.CLASS_MAP.put(c.prototype.cType, c);
		}else{
		   // skip now
		}
	},
	build : function(cObj){
		if(cObj && cObj.cType){
			var obj = new Sim.ref.CLASS_MAP.get(cObj.cType);
			for(var v in cObj){
			    var item = cObj[v];
			    if (v == Sim.ref.SUB_TYPE && item && item.length && obj.add) {
			    	for(var i = 0; i < item.length; i++){
			    		var child = Sim.ref.build(item[i]);
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
		var e = Sim.$(id);
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
		e.id = this.id || SimUtil.uniqueNum();
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
SimUtil.extend(Component, $_obj);
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

SimUtil.extend(Button, $_component);

var Panel = function(i, v) {
	Panel.prototype.cType = "div";
	this.hashcode = Math.random();
	this.id = i;
	this.vElem = null;
	this.innerText = v;

	return this.vElem;
};
SimUtil.extend(Panel, $_component);

var Label = function(i, v) {
	Label.prototype.cType = "span";
	this.hashcode = Math.random();
	this.id = i;
	this.vElem = null;
	this.innerText = v;

	return this.vElem;
};
SimUtil.extend(Label, $_component);

var Option = function(i, n, v) {
	Option.prototype.cType = "option";
	this.hashcode = Math.random();
	this.id = i;
	this.name = n;
	this.value = v;
	this.vElem = null;
	return this.vElem;
};
SimUtil.extend(Option, $_component);

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
SimUtil.extend(Select, $_component);

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
SimUtil.extend(Input, $_component);
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
SimUtil.extend(CheckBox, $_input);

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
SimUtil.extend(Radio, $_input);

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
SimUtil.extend(Submit, $_input);

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
SimUtil.extend(Reset, $_input);

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
SimUtil.extend(File, $_input);

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
SimUtil.extend(TextField, $_input);

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
SimUtil.extend(Password, $_input);

var TextArea = function(i, n, v) {
	TextArea.prototype.cType = "textarea";
	this.hashcode = Math.random();
	this.id = i;
	this.name = n;
	this.value = v;
	this.vElem = null;
	return this.vElem;
};
SimUtil.extend(TextArea, $_component);