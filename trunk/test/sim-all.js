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
				if((!child[key]) && (key != "cType") && (key != "eType")){
					child.prototype[key] = parent[key];
				}
			}
			
			if(!flag){
				if(child != String){
					child.prototype["toString"] = parent.toString;
				}
				child.prototype.parentClass = parent;
			}
		}
		
		return child;
	},
	extendAll : function(child, parent){
		if(parent){
			for(var key in parent){
				child.prototype[key] = parent[key];
			}
		}
		return child;
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
	},
	regGlobalVar : function(varName, varVal){
		window[varName] = varVal;
		return window[varName];
	},
	regClassProto : function(clsName){
		try{
			return SimUtil.regGlobalVar("$_" + clsName.substring(0, 1).toLowerCase() + clsName.substring(1), eval("new " + clsName + "()"));
		}catch(e){alert(e.message)}
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
	
	SimUtil.regClassProto("Obj");
}

SimUtil.extend(String, $_obj);
String.prototype.cType = "String";
String.prototype.trim = function() {
	return this.replace(/^\s+/g, "").replace(/\s+$/g, "");  
}  


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
	
	SimUtil.extend(Thread, $_obj);
}

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
	
	SimUtil.extend(List, $_obj);
	SimUtil.regClassProto("List");
}

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
	
	SimUtil.extend(Map, $_obj);
	SimUtil.regClassProto("Map");
}

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
	
	SimUtil.extend(Set, $_obj);
	SimUtil.regClassProto("Set");
}

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
	
	SimUtil.extend(HashMap, $_obj);
	SimUtil.regClassProto("HashMap");
};

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
	
	SimUtil.extend(HashSet, $_obj);
	SimUtil.regClassProto("HashSet");
};

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
	},
	add: function(elem){
		this.appendChild(elem);
		return this;
	},
	remove: function(){
		if(this.parentNode){
			this.parentNode.removeChild(this);
		}
		return this;
	}
};

//wait for next release
SimUtil.querySelector = function(query){
	if(document.querySelectorAll){
		return document.querySelectorAll(query);
	}else{
		
	}
};

Sim.$ = function(elem){
	if(elem){
		elem = (elem.cType == String.prototype.cType) ? document.getElementById(elem) : elem;
		return SimUtil.config(elem, Sim.DomUtil);
	}
};

try{
	if($){}else{
		$ = Sim.$;
	}
}catch(e){
	$ = Sim.$;
}

Array.prototype.each = function(func){
	for(var index = 0; index < this.length; index++){
		func.call(this[index], index);
	}
};

Sim.ref = {
	_CLASS_MAP : new Map(),
	SUB_TYPE : "children",
	regClass : function(c){
		if(c && c.prototype.cType){
			Sim.ref._CLASS_MAP.put(c.prototype.cType, c);
		}else{
		   // skip now
		}
	},
	_create : function(type){
		if(Component.isInputType(type)){
			var input = new Input();
			input.eType = Component.getEType(type);
			return input;
		}else if(Component.isSupportedClass(type)){
			return SimUI.create(Component.getEType(type), type);
		}else{
			return SimUI.create(type, type);
		}
	},
	build : function(cObj){
		if(cObj && cObj.cType){
			var obj = Sim.ref._create(cObj.cType);
			for(var v in cObj){
			    var item = cObj[v];
			    if (v == Sim.ref.SUB_TYPE && item && item.length && obj.add) {
			    	for(var i = 0; i < item.length; i++){
			    		var child = Sim.ref.build(item[i]);
			    		if(child){
			    			obj.add(child);
			    		}
			    	}
			    }else if(v == "parent"){
			    	// ignore first
			    }else{
			    	obj[v] = item;
			    }
			}
			
			var parent = cObj["parent"];
	    	if(parent){
	    		if(parent.cType && parent.eType){
	    			parent.add(obj);
	    		}else{
	    			parent.appendChild(obj.element());
	    		}
	    	}
		}
		  
		if(cObj.id){
		 	SimUtil.regGlobalVar(cObj.id, obj);
		}
	    return obj;
	}
}

var SimUI = {
	fetch : function(id) {
		var e = Sim.$(id);
		var c = new Component(e.id, e.name);
		c._vElem = e;

		return c;
	},
	create : function(eType, cType) {
		return SimUtil.config(new Component(), {cType: cType, eType:eType});
	},
	clone : function(comp) {
		var c = new Component();
		c.cType = comp.cType;
		c.eType = comp.eType;
		for (key in comp) {
			try {
				c[key] = comp[key];
			} catch (e) {}
		}
		//remove exists elem to create new
		c._elem = null;
		
		return c;
	}
}

var Component = function() {
	this.hashcode = SimUtil.uniqueNum();
	this.construct.apply(this, arguments);
	this._vElem = null;
};
{
	Component.prototype.cType = "Component";
	Component._eventsRegex = /^(click|change|mouseover|mouseout|dblclick|blur|focus|load|unload)$/;
	
	Component._copyAttrs = function(){
		
		try {
			for ( var x in this) {
				if (Component._eventsRegex.test(x)) {
					SimUtil.on(this._vElem, x, this.click);
				} else if (x == "parent") {
					if (!this.parent) {
						// nothing
					} else if (!this.parent.cType) {
						this.parent.appendChild(this._vElem);
					} else {
						this.parent.add(this._vElem);
					}
				} else if (x == "value") {
					if (this.cType == "Button") {
						this._vElem.innerText = this[x];
						this._vElem.textContent = this[x];
					}
				} else {
					if (x != "cType" && x != "eType" && x != "_vElem" && this[x]
							&& typeof (this[x]) != "function") {
						this._vElem[x] = this[x];
						try{
							this._vElem.setAttribute(x, this[x]);
						}catch(ex){}
					}

					if (x == "innerText") {
						this._vElem.innerText = this.innerText;
						this._vElem.textContent = this.innerText;
					}
				}
			}
		} catch (exc) {
			alert(exc.message + " " + this.eType + " don't support the type:" + x);
		}
	}
	
	Component.prototype.element = function() {
		
		if(!this._vElem){
			this._vElem = document.createElement(this.eType);
			this._vElem.value = this.value;
			this._vElem.id = this.id || SimUtil.uniqueNum();
			
			Component._copyAttrs.apply(this, arguments);
		}
		
		return this._vElem;
	};

	Component.prototype.add = function(elem) {
		if (!elem.cType && !this._vElem) {
			this.element().appendChild(elem);
		} else {
			this.element().appendChild(elem.element());
		}
	};
	
	Component.prototype.setStyle = function(cName) {
		this.element().className = cName;
	};
	
	Component.prototype.getStyle = function(cName) {
		return this.element().className;
	};
	
	Component.prototype.addStyle = function(cName) {
		this.element().className += cName;
	};
	
	Component.prototype.removeStyle = function(cName) {
		var cn = this.element().className || "";
		while(cn.indexOf(cName)>=0)cn.replace(cName, "");
		this.element().className = cn.trim();
	};
	
	Component.prototype.removeAll = function() {
		this.element().innerHTML = "";
	};

	Component.prototype.css = function(key, value) {
		try {
			this.element().style[key] = value;
		} catch (e) {}
	};

	Component.prototype.setContent = function(content) {
		try {
			this.element().innerText = content;
			this.element().textContent = content;
		} catch (e) {
		}
	};
	
	Component.prototype.get = function(key){
		return this.element()[key]||this.element().getAttribute(key);
	};
	
	Component.prototype.set = function(key, value){
		try {
			this.element()[key] = value;
			this.element().setAttribute(key, value);
		} catch (exc) {
		}
	};
	
	SimUtil.extend(Component, $_obj);
	SimUtil.regClassProto("Component");
	
	{
		//define the classes for subclass of components.
		
		var CompDataUtil = {
			_nonValueElements : {
				"Div":"div",
				"Span":"span",
				"Label":"label",
				"Table":"table",
				"Tbody":"tbody",
				"Thead":"thead",
				"Th":"th",
				"Tr":"tr",
				"Td":"td",
				"Br":"br"
			},
			_valueElements : {
				"Select":"select",
				"Option":"option",
				"Button":"button",
				"Textarea":"textarea",
				"Input":"input"
			},
			_inputElements : {
				"TextField":"text",
				"RadioButton":"radio",
				"IButton":"button",
				"SubmitButton":"submit",
				"ResetButton":"rest",
				"PasswordField":"password",
				"Checkbox":"checkbox",
				"File":"file"
			}
		};
		
		Component.isInputType = function(cType){
			return cType in CompDataUtil._inputElements;
		};
		
		Component.isSupportedClass = function(cType){
			return (cType in CompDataUtil._nonValueElements) 
				|| (cType in CompDataUtil._valueElements) 
				|| (cType in CompDataUtil._inputElements);
		}
		
		Component.getEType = function(cType){
			return CompDataUtil._nonValueElements[cType] 
				|| CompDataUtil._valueElements[cType]
				|| CompDataUtil._inputElements[cType];
		}
		
		for(var key in CompDataUtil){
			
			var isInput = (key == "_inputElements");
			
			var elements = CompDataUtil[key];
			
			for(var clsName in elements){
				var eType = elements[clsName];
				
				SimUtil.extendAll(
					SimUtil.extend(SimUtil.regGlobalVar(clsName, 
							(key == "_nonValueElements") ? function(){
															this.hashcode = SimUtil.uniqueNum();
															this.construct.apply(this, arguments);
															
															if(arguments.length > 2){
																if(arguments[3]){
																	this.innerHTML = arguments[2];
																}else{
																	this.appendChild(document.createTextNode(arguments[2]));
																}
															}
														}
														: function(){
															this.hashcode = SimUtil.uniqueNum();
															this.construct.apply(this, arguments);
															
															if(arguments.length > 2){
																this.value = arguments[2];
															}
														}
															
							), isInput ? $_input : $_component),
					{cType : clsName, eType : eType});
				
				SimUtil.regClassProto(clsName);
			}
		}
		
		//override add/remove function for Select
		Select.prototype.add = function(elem) {
			if (!elem.cType && !this._vElem) {
				this.element().options.add(elem);
			} else {
				this.element().options.add(elem.element());
			}
		};

		Select.prototype.remove = function(elem) {
			if (!elem.cType && !this._vElem) {
				this.element().options.remove(elem);
			} else {
				this.element().options.remove(elem.element());
			}
		};
		
		Input.prototype.element = function() {
			if (window.ActiveXObject) {
				this._vElem = document.createElement("<input type=\"" + this.eType
						+ "\" name=\"" + this.name + "\" />");
			} else {
				this._vElem = document.createElement("input");
				
				this._vElem.type = this.eType;
				this._vElem.name = this.name;
			}
			
			if(this.value){
				try {
					this._vElem.value = this.value;
				} catch (e) {
					//this._vElem["value"] = this.value;
				}
			}
			
			this._vElem.id = this.id;
			Component._copyAttrs.apply(this, arguments);
			
			return this._vElem;
		}
	}
}