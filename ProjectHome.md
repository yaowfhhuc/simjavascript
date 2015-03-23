_SimJs第一版终于完成了，大家可以下载代码进行尝试。_

一时找不到合适的词来定义这个框架，可能并不会被适用，但是它是我的一些设计。本框架是站在后台程序员的角度设计的，如果你是一个后台程序员，想用自己的后台开发经验玩转前台的技术，那么这个框架你选对了。

目前流行的前台开发框架(Js框架)如JQuery,适用范围很广，大多数前台人员都能很好的上手，SmartClient(RIA)和ExtJs,都是RIA的很好的框架实现，并提供了良好的UI支持(skins),由于我对CSS的研究还不够，UX的设计思路还不足以构建一套完整的UI，所以SimJs第一版不包含任何CSS的源生支持，用此框架进行开发的时候，需要自行对各元素进行样式定义(适用css文件即可)。

应用本框架需要对Js以及dom编程有一定的了解，因此对开发人员的要求有点偏高（不像JQuery那样可以直接将 html解析成dom），如果你曾经学习过Java的AWT或者SWING，那么可能会更好上手一点。

本框架部分借鉴了JQuery的事件绑定等相关方法(bind和unbind)，也借鉴了SmartClient的基于JSON的树形构建页面元素的方法（相对于html语言，用json描述来展现页面元素）。

接下来一段时间，我将用此框架实现自己的网站，纯RIA的web应用，希望有一名用户交互设计师能友情加入这个团队，如果你对此感兴趣，请联系smtd5@126.com


该框架使用Dom的方式，用来方便的构建页面元素，主要有以下两种模式：
## 1.类似Java的语法： ##

```
var btn = new Button(id, name);
SimUtil.config(btn, {
    prop1:value1,
    prop2:value2
});
```

## 2. 利用反构造机制，使用统一的构造方法，指定构造对象的类型(cType). ##

```
Sim.ref.build({
    cType:"<classType>",
    property1:..
     property2:..
    children:[
        loop..
    ]
})
```


## API简介： ##
### obj: SimUtil 工具类 ###
用于构建/继承/配置对象，提供SimJs的onload方法，动态加载/引用Js文件等。

```
    SimUtil.uniqueNum();// 返回唯一的数值ID,基于时间戳生成

    SimUtil.attachEvent(el, event, func); //给对象el 绑定event事件,绑定函数为func.
    SimUtil.attachEvent(el, "click", function(){
                                        alert("hello");
                                     });
    SimUtil.on = SimUtil.attachEvent.

    SimUtil.removeEvent(el, event, func);//和attachment对应
     SimUtil.asFunc(func);//将字符串转化为函数
     var myFunc = SimUtil.asFunc("alert(ok.);");

     SimUtil.onload(func);// 传入的函数将在dom ready 之后调用。
     SimUtil.include(src);//动态加载js,该调用可以写在js文件中。
  
     SimUtil.extend(child, parent, flag);//copy 继承，flag为false时自动继承parent的toString方法。
     SimUtil.config(elem, cObj);// 将cObj对象的属性赋值到elem中去。
   
     SimUtil.hash(str);//将str hash得到对应的hash值。

     SimUtil.delegate(func, time);//等同setTimeout, time如果为空，默认为1毫秒.
     
    SimUtil.regGlobalVar(varName, value);//将变量注册为全局变量。
  
 
    Sim.Ajax({
      url:reqUrl,
      params:reqParams,  //json or string
      method:reqMethod, // POST/GET, default GET
      async:isAsync //defalut true
    })
     

```

### class: Obj ###
所有SimJs定义的类得父类，提供了一系列基本的方法，如hashcode, toString等。

所有Sim object的class都有类型，可以通过cType属性获得，如:
var obj = new Obj();
alert(obj.cType);

```
var obj = new Obj();

//所有SimJs里面定义的类所构建的对象都有以下方法：
    obj.hashCode();//得到对象的hashcode

   obj.equals(obj2);//判断两个对象是否相等,在HashMap/HashSet中用作比较
    
   obj.toString();//返回由对象类型，id和hashcode构成的字符串.

```

### class: Thread ###
简单的线程模拟，但是实际上这些线程调用还是顺序执行的，不过他们可以同时启动。

```
   var t1 =  new Thread(function(){
      alert(1);
   });

   var t2 = new Thread("alert(2)");
   
   var func3 = function(){
      alert(3);
   }
    
   var t3 = new Thread(func3);

   t1.start();
   t2.start();
   t3.start();
```

### class: Map ###
基于Javascript对象的map实现，用来存储键-值对数据。

```
var map = new Map();
map.put("a", "a1");
map.put("b", "b1");
map.put("a", "asdf");

map.remove("a");

alert(map.get("b"));

alert(map.size());

alert(map.contains("b"));		
alert(map.containsValue("b"));
//遍历的方法和 HashMap不同		
for(var x in map.entries()){
    alert(x + " : " + map.entries()[x]);
}

```

### class: List ###
基于数组的list实现(元素可以重复)。
```

var list = new List();
list.add("a");
list.add("b");
list.add("a");
list.insert("c", 1);

alert(list.get(1));

alert(list.remove(2));

alert(list.size());
		
alert(list.contains("b"));

for(var x = 0; x < list.size(); x ++){
    alert(x + " : " + list.get(x));
}


```

### class: Set ###
基于Map对应的Set实现（元素不允许重复,相同的元素将会覆盖）。

```

var set = new Set();
set.add("a");
set.add("b");
set.add("a");

set.remove("a");

alert(set.size());
		
alert(set.contains("b"));
		
for(var x in set.entries()){
    alert(x + " : " + set.entries()[x]);
}

```

### class: HashMap ###
基于Hash的map实现，类似Java的HashMap。

```

//用法和Map类似，除了遍历元素不一致，如下:
for(var item = map.iterator(); item; item = item.nextItem()){
    alert(item.key + " : " + item.value);
}


```

### class: HashSet ###
基于HashMap的set实现，类似Java的HashSet。

```

//用法和Set类似，除了遍历元素不一致，如下:
for(var item = set.iterator(); item; item = item.nextItem()){
    alert(item.value);
}

```

### obj: Sim.$ ###
用于获取已经存在的对象，通过ID来获取（不支持queryselector）。
（如果结合Jquery使用本框架，$将被Jquery应用，如果$没有被定义，那么$ = Sim.$）

```
//假设页面中有一个id为mDiv的元素
Sim.$("mDiv").bind("click", function(){"alert(1)"});

var func2 = function(){alert(2)};
Sim.$("mDiv").bind("click", func2);

Sim.$("mDiv").unbind("click", func2);//移除绑定的func2,

Sim.$("mDiv").unbind("click");//移除绑定的onclick事件

Sim.$("mDiv").unbind();//移除由Sim.$().bind绑定的所有事件。

```

### Obj: Sim.ref ###
用于基于Json构建页面元素。

```
Sim.ref.build({
    cType:"Div",
    children:[//children中的元素可以继续构建children
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

```


### Obj: SimUI ###
用于构建非预定义的页面元素，通过该对象构建的页面元素将是Component的实例。

```

var mDiv = SimUI.fetch("mDiv");//将对象取出并封装成Component对象,对象mDiv将拥有Component的方法

var breakLine = SimUI.create("br", "Br"); //动态构建新的Component对象，该对象将生成<br>, 且对象的类型名为Br

var c = SimUI.clone(mDiv);//复制对象，仅针对new Component()/或其它已申明的类型生成的对象。

```

### class: Componenet ###
所有SimJs定义的页面元素的类得父类，提供一系列页面元素的相关的方法。


```
var x = new Component(id, name, innerText);//对于Compoennt,没有实际可以展示的元素对应，需要指定eType,如:

SimUtil.config(x, {
    eType:"div",
    parent:document.body
  });

x.element();//该操作将x实例化显示。


//可以调用的方法:

x.on("click", function(){alert()});//同  Sim.$().bind();
x.off("click");//同 Sim.$().unbind();
x.add(subElement);//添加子元素
x.removeAll();//移除所有子元素
var clsName = x.setStyle(className);//设置x 的className
x.getStyle();//获取x的className
x.css("display", "block");//设置失败不会抛出异常，需要确定设置的样式是正确的
x.setContent("anything");//设置innerText, 非 innerHTML
x.set(key, val);//设置 attr
x.get(key);//获取attr
```

页面元素类:
Div, Span, Select, Option, Table, Thead, Tbody, Tb, Tr, Th, Br, Input, Button.

```

var mDiv = new Div(id, name, innerText);//用法同Component,

```


公用构造函数接收3个参数， (id, name, innerText)
(对于某些类，第三个参数无意义，Table, Tbody, Thead, Tb, Tr, Th, Br, Input)

表单元素类:
IButton, TextField, TextArea, Password, RadioButton, CheckBox, File.
公用构造函数接收3个参数， (id, name, value)

```

var text = new TextField(id, name, value);
var btn = new IButton(id, name, value);
btn.bind("click", "hey, you click me.");

```