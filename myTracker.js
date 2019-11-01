(function() {
  var enterTime = 0;
  var outTime = 0;
  var eventHover = null;
  var hoverIgnore = ['HTML', 'BODY']
  // 点击事件
  window.addEventListener('click', (event) => {
    // 事件对象兼容
    const eventFix = getEvent(event);
    if(!eventFix) {
      return;
    }
    
  })

  // hover事件
  window.addEventListener('mouseover', (event) => {
    // 事件对象兼容
    const eventFix = getEvent(event);
    // console.log(eventFix)
    if(!eventFix  || hoverIgnore.includes(eventFix.target.tagName)) {
      eventHover = null;
      return;
    }
    enterTime = +new Date();
    eventHover = eventFix;
  })
  window.addEventListener('mouseout', (event) => {
    // 事件对象兼容
    outTime = +new Date();
    if(eventHover && outTime - enterTime>500) {
      _handleEvent(eventHover);
    }
  })

  // 事件对象
  function getEvent(event) {
    event = event || window.event;
    if(!event) return event;
    if(!event.target) {
      event.target = event.srcElement;
    }
    if(!event.currentTarget) {
      event.currentTarget = event.srcElement;
    }
    return event;
  }

  // 处理事件对象
  function _handleEvent(event) {
    const domPath = getDomPath(event.target)

    const rect = getBoundingClientRect(event.target);
    console.log(rect)
    if(rect.width == 0 || rect.htight == 0) return;

    let t = document.documentElement || document.body.parentNode;
    const scrollX = (t && typeof t.scrollLeft=='number' ? t : document.body).scrollLeft;
    const scrollY = (t && typeof t.scrollTop=='number' ? t : document.body).scrollTop;
    const pageX = event.pageX || event.clientX + scrollX;
    const pageY = event.pageY || event.clientY + scrollY;
    const {origin, pathname, protocol} = location;
    const path = {origin, pathname, protocol}
    const pathStr = JSON.stringify(path)
    const eventType = event.type=='mouseover'?'hover':event.type;
    const data = {
      domPath: encodeURIComponent(domPath),
      trackingType: eventType,
      offsetX: ((pageX - rect.left - scrollX) / rect.width).toFixed(6),
      offsetY: ((pageY - rect.top - scrollY) / rect.height).toFixed(6),
      path: encodeURIComponent(pathStr)
    }
    console.log('myTracker==>', data)
    send(data)
  }

  // 获取元素路径
  function getDomPath(element, useClass=false) {
    if(!(element instanceof HTMLElement)) {
      console.warn('input is not a html element');
      return '';
    }
    let domPath = [];
    let ele = element;
    while(ele) {
      let domDesc = getDomDesc(ele, useClass);
      if(!domDesc) {
        break;
      }
      domPath.unshift(domDesc);
      if(querySelector(domPath.join('>'))===ele || domDesc.indexOf('body')>=0) {
        break;
      }
      domPath.shift();
      const children = ele.parentNode.children;
      if(children.length>1) {
        for(let i=0;i<children.length;i++) {
          if(children[i] === ele) {
            domDesc += `:nth-child(${i+1})`;
            break;
          }
        }
      }
      domPath.unshift(domDesc);
      if(querySelector(domPath.join('>'))===ele) {
        break;
      }
      ele = ele.parentNode
    }
    return domPath.join('>')
  }

  // 获取元素节点名或别名与修饰
  function getDomDesc(element, useClass) {
    const domDesc = [];
    if(!element || !element.tagName) {
      return '';
    }
    if(element.id) {
      return `#${element.id}`;
    }
    domDesc.push(element.tagName.toLowerCase());
    if(useClass) {
      const className = element.className;
      if(className && typeof className === 'string') {
        const classes = className.split(/\s+/);
        domDesc.push(`.${classes.join('.')}`);
      }
    }
    if(element.name) {
      domDesc.push(`[name=${element.name}]`)
    }
    return domDesc.join('')
  }

  // 返回操作元素数据
  function getBoundingClientRect(element){
    const rect = element.getBoundingClientRect();
    console.log(rect)
    const width = rect.width || rect.right - rect.left;
    const height = rect.heigth || rect.bottom - rect.top;
    const {x,y,left,right,top,bottom} = rect;
    const newRect = {x,y,left,right,top,bottom,width,height}
    
    return newRect;
  }
  // 利用图片请求将数据发送给后台
  function send(data) {
    // 创建1像素图片
    const image = new Image(1,1);
    image.onload = function() {
      image = null;
    }
    const search = params(data)
    image.src = `/?${search}`
  }
  function querySelector(queryString) {
    return document.getElementById(queryString) || document.getElementsByName(queryString)[0] || document.querySelector(queryString);
  }
  function params(obj) {
    var arr = [];
    for (var key in obj) {
      arr.push("".concat(key, "=").concat(obj[key]));
    }
    return arr.join('&');
  };
})()