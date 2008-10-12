Primer = function(container, width, height) {
  this.container = container
  this.width = width
  this.height = height
  
  this.hits = []
  
  this.init()
}

Primer.prototype = {
  init: function() {
    var els = $(this.container)
    els.append('<canvas width="' + this.width + '" height="' + this.height + '"></canvas>')
    var jelc = $(this.container + ' canvas')
    var elc = jelc[0]
    this.context = elc.getContext('2d')
    
    this.root = new Primer.Layer()
    this.root.bind(this)
    
    var self = this
    jelc.eq(0).mousemove(function(e) {
      e.localX = e.clientX - elc.offsetLeft
      e.localY = e.clientY - elc.offsetTop
      self.ghost(e)
    })
  },
  
  addChild: function(child) {
    child.bind(this)
    this.root.addChild(child)
    this.draw()
  },
  
  draw: function() {
    this.context.clearRect(0, 0, this.width, this.height)
    this.root.draw()
  },
  
  ghost: function(e) {
    this.root.ghost(e)
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
  bind: function(primer) {
    this.primer = primer
    
    for(var i in this.children) {
      this.children[i].bind(primer)
    }
  },
  
  get context() {
    return this.primer.context
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
    child.bind(this.primer)
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
  
  fill: function() {
    this.calls.push(["fill"])
  },
  
  stroke: function() {
    this.calls.push(["stroke"])
  },
  
  fillRect: function(a, b, c, d) {
    this.calls.push(["fillRect", a, b, c, d])
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
        case "fill":        this.context.fill(); break
        case "stroke":      this.context.stroke(); break
      }
    }
    
    for(var i in this.children) {
      this.children[i].draw()
    }
    
    this.context.restore()
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
        case "fill":        this.ghostFill(e); break
      }
    }
    
    for(var i in this.children) {
      e.localX -= this.x
      e.localY -= this.y
      this.children[i].ghost(e)
    }
    
    this.context.restore()
  },
  
  ghostFillRect: function(e, x, y, w, h) {
    this.context.beginPath()
    this.context.moveTo(x, y)
    this.context.lineTo(x + w, y)
    this.context.lineTo(x + w, y + h)
    this.context.lineTo(x, y + h)
    this.context.lineTo(x, y)
    
    // console.log([e.localX, e.localY])
    
    if(this.context.isPointInPath(e.localX - this.x, e.localY - this.y)) {
      if(!this.mouseWithin) {
        this.mouseoverVal(e)
      }
      
      this.mouseWithin = true
    } else {
      if(this.mouseWithin) {
        this.mouseoutVal(e)
      }
      
      this.mouseWithin = false
    }
  },
  
  ghostFill: function() {
    
  }
}