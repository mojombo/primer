Primer = function(container, width, height) {
  this.container = container
  this.width = width
  this.height = height
  
  this.init()
}

Primer.prototype = {
  init: function() {
    var els = $(this.container)
    els.append('<canvas width="' + this.width + '" height="' + this.height + '"></canvas>')    
    var elc = $(this.container + ' canvas')[0]
    this.context = elc.getContext('2d')
    
    this.root = new Primer.Layer()
    this.root.bind(this)
  },
  
  addChild: function(child) {
    child.bind(this)
    this.root.addChild(child)
    this.draw()
  },
  
  draw: function() {
    this.context.clearRect(0, 0, this.width, this.height)
    this.root.draw()
  }
}

Primer.Layer = function() {
  this.primer = null
  
  this.children = []
  this.calls = []
  
  this.xval = 0
  this.yval = 0
}

Primer.Layer.prototype = {
  bind: function(primer) {
    this.primer = primer
  },
  
  get context() {
    return this.primer.context
  },
  
  get x() {
    return this.xval
  },
  
  set x(xval) {
    this.xval = xval
    if(this.primer) this.primer.draw()
  },
  
  get y() {
    return this.yval
  },
  
  set y(yval) {
    this.yval = yval
    if(this.primer) this.primer.draw()
  },
  
  addChild: function(child) {
    child.bind(this.primer)
    this.children.push(child)
    this.primer.draw()
  },
  
  beginFill: function(a) {
    this.calls.push(["fillStyle", a])
  },
  
  endFill: function() {
    this.calls.push(["fill"])
  },
  
  lineStyle: function(a) {
    this.calls.push(["strokeStyle", a])
  },
  
  fillRect: function(a, b, c, d) {
    this.calls.push(["fillRect", a, b, c, d])
  },
  
  draw: function() {
    this.context.save()
    this.context.translate(this.x, this.y)
    
    for(var i in this.calls) {
      var call = this.calls[i]
      
      switch(call[0]) {
        case "strokeStyle": this.context.strokeStyle = call[1]; break
        case "fillStyle":   this.context.fillStyle = call[1]; break
        case "fillRect":    this.context.fillRect(call[1], call[2], call[3], call[4]); break
        case "fill":        this.context.fill(); break
      }
    }
    
    for(var i in this.children) {
      this.children[i].draw()
    }
    
    this.context.restore()
  }
}