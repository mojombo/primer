Primer = function(container, width, height) {
  this.container = container
  this.width = width
  this.height = height
  
  this.actions = []
  
  this.init()
}

Primer.prototype = {
  init: function() {
    $("html head").append("<style>.primer_text { margin: 0; padding: 0; }</style>")
    
    var el = $(this.container).eq(0)
    el.css("position", "relative")
    el.append('<canvas width="' + this.width + '" height="' + this.height + '"></canvas>')
    var jelc = $('canvas', el)
    var elc = jelc[0]
    this.context = elc.getContext('2d')
    this.element = el
    
    this.root = new Primer.Layer()
    this.root.bind(this)
    
    var self = this
    jelc.eq(0).mousemove(function(e) {
      e.localX = e.clientX - elc.offsetLeft
      e.localY = e.clientY - elc.offsetTop
      self.ghost(e)
    })
  },
  
  get primer() {
    return this
  },
  
  get x() {
    return 0
  },
  
  get y() {
    return 0
  },
  
  get globalX() {
    return 0
  },
  
  get globalY() {
    return 0
  },
  
  addChild: function(child) {
    child.bind(this)
    this.root.addChild(child)
    this.draw()
  },
  
  draw: function() {
    this.context.clearRect(0, 0, this.width, this.height)
    $(".primer_text", this.element).remove()
    this.root.draw()
  },
  
  ghost: function(e) {
    this.root.ghost(e)
    for(var i in this.actions) {
      var action = this.actions[i]
      action[0](action[1])
    }
    this.actions = []
  }
}

Primer.Layer = function() {
  this.primer = null
  
  this.children = []
  this.calls = []
  
  this.xVal = 0
  this.yVal = 0
  
  this.visibleVal = true
  
  this.mouseoverVal = function() { }
  this.mouseoutVal = function() { }
  
  this.mouseWithin = false
}

Primer.Layer.prototype = {
  bind: function(parent) {
    this.parent = parent
    this.primer = parent.primer
    
    for(var i in this.children) {
      this.children[i].bind(this)
    }
  },
  
  get context() {
    return this.primer.context
  },
  
  get element() {
    return this.primer.element
  },
  
  /* x and y getters and setters */
  
  get x() {
    return this.xVal
  },
  
  set x(xVal) {
    this.xVal = xVal
    if(this.primer) this.primer.draw()
  },
  
  get y() {
    return this.yVal
  },
  
  set y(yVal) {
    this.yVal = yVal
    if(this.primer) this.primer.draw()
  },
  
  /* global x and y getters */
  
  get globalX() {
    return this.x + this.parent.globalX
  },
  
  get globalY() {
    return this.y + this.parent.globalY
  },
  
  /* visibility getter/setter */
  
  get visible() {
    return this.visibleVal
  },
  
  set visible(visibleVal) {
    this.visibleVal = visibleVal
    if(this.primer) this.primer.draw()
  },
  
  /* children */
  
  addChild: function(child) {
    child.bind(this)
    this.children.push(child)
    if(this.primer) this.primer.draw()
  },
  
  /* events */
  
  mouseover: function(fn) {
    this.mouseoverVal = fn
  },
  
  mouseout: function(fn) {
    this.mouseoutVal = fn
  },
  
  /* canvas api */
  
  set fillStyle(a) {
    this.calls.push(["fillStyle", a])
  },
  
  set strokeStyle(a) {
    this.calls.push(["strokeStyle", a])
  },
  
  beginPath: function() {
    this.calls.push(["beginPath"])
  },
  
  moveTo: function(a, b) {
    this.calls.push(["moveTo", a, b])
  },
  
  lineTo: function(a, b) {
    this.calls.push(["lineTo", a, b])
  },
  
  fill: function() {
    this.calls.push(["fill"])
  },
  
  stroke: function() {
    this.calls.push(["stroke"])
  },
  
  fillRect: function(a, b, c, d) {
    this.calls.push(["fillRect", a, b, c, d])
  },
  
  fillText: function(a, b, c, d) {
    this.calls.push(["fillText", a, b, c, d])
  },
  
  /* draw */
  
  draw: function() {
    if(!this.visible) { return }
    
    this.context.save()
    this.context.translate(this.x, this.y)
    
    for(var i in this.calls) {
      var call = this.calls[i]
      
      switch(call[0]) {
        case "strokeStyle": this.context.strokeStyle = call[1]; break
        case "fillStyle":   this.context.fillStyle = call[1]; break
        case "fillRect":    this.context.fillRect(call[1], call[2], call[3], call[4]); break
        case "beginPath":   this.context.beginPath(); break
        case "moveTo":      this.context.moveTo(call[1], call[2]); break
        case "lineTo":      this.context.lineTo(call[1], call[2]); break
        case "fill":        this.context.fill(); break
        case "stroke":      this.context.stroke(); break
        case "fillText":    this.replacementFillText(call[1], call[2], call[3], call[4]); break
      }
    }
    
    for(var i in this.children) {
      this.children[i].draw()
    }
    
    this.context.restore()
  },
  
  /* canvas extensions */
  
  replacementFillText: function(text, x, y, width) {
    var styles = ''
    styles += 'position: absolute;'
    styles += 'left: ' + (this.globalX + x) + 'px;'
    styles += 'top: ' + (this.globalY + y) + 'px;'
    styles += 'width: ' + width + 'px;'
    this.element.append('<p class="primer_text" style="' + styles + '">' + text + '</p>')
  },
  
  /* ghost */
  
  ghost: function(e) {
    if(!this.visible) { return }
    
    this.context.save()
    this.context.translate(this.x, this.y)
    
    for(var i in this.calls) {
      var call = this.calls[i]
      
      switch(call[0]) {
        case "fillRect":    this.ghostFillRect(e, call[1], call[2], call[3], call[4]); break
        case "beginPath":   this.context.beginPath(); break
        case "moveTo":      this.context.moveTo(call[1], call[2]); break
        case "lineTo":      this.context.lineTo(call[1], call[2]); break
        case "fill":        this.ghostFill(e); break
      }
    }
    
    for(var i in this.children) {
      if (!jQuery.browser.safari) {
        e.localX -= this.x
        e.localY -= this.y
      }
      this.children[i].ghost(e)
    }
    
    this.context.restore()
  },
  
  ghostDetect: function(e) {
    if (!jQuery.browser.safari) {
      testX = e.localX - this.x
      testY = e.localY - this.y
    } else {
      testX = e.localX
      testY = e.localY
    }
    
    if(this.context.isPointInPath(testX, testY)) {
      if(!this.mouseWithin) {
        this.primer.actions.push([this.mouseoverVal, e])
      }
      
      this.mouseWithin = true
    } else {
      if(this.mouseWithin) {
        this.primer.actions.push([this.mouseoutVal, e])
      }
      
      this.mouseWithin = false
    }
  },
  
  ghostFillRect: function(e, x, y, w, h) {
    this.context.beginPath()
    this.context.moveTo(x, y)
    this.context.lineTo(x + w, y)
    this.context.lineTo(x + w, y + h)
    this.context.lineTo(x, y + h)
    this.context.lineTo(x, y)
    
    // console.log([e.localX, e.localY])
    
    this.ghostDetect(e)
  },
  
  ghostFill: function(e) {
    this.ghostDetect(e)
  }
}