Primer = function(container, width, height) {
  this.container = container
  this.width = width
  this.height = height
  
  this.init()
}

Primer.prototype = {
  init: function() {
    this.root = new Primer.Layer()
    
    var els = $(this.container)
    els.append('<canvas width="' + this.width + '" height="' + this.height + '"></canvas>')    
    var elc = $(this.container + ' canvas')[0]
    this.context = elc.getContext('2d')
  },
  
  addChild: function(child) {
    child.context = this.context
    this.root.addChild(child)
    this.draw()
  },
  
  draw: function() {
    this.root.draw()
  }
}

Primer.Layer = function() {
  this.children = []
  this.calls = []
}

Primer.Layer.prototype = {
  addChild: function(child) {
    this.children.push(child)
  },
  
  beginFill: function(a) {
    this.calls.push(["fillStyle", a])
  },
  
  endFill: function() {
    this.calls.push(["fill"])
  },
  
  fillRect: function(a, b, c, d) {
    this.calls.push(["fillRect", a, b, c, d])
  },
  
  draw: function() {
    for(var i in this.calls) {
      var call = this.calls[i]
      if(call[0] == "fillStyle") { this.context.fillStyle = call[1] }
      else if(call[0] == "fillRect") { this.context.fillRect(call[1], call[2], call[3], call[4]) }
      else if(call[0] == "fill") { this.context.fill() }
    }
    
    for(var i in this.children) {
      this.children[i].draw()
    }
  }
}