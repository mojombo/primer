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
    console.log(els)
    
    var elc = $(this.container + ' canvas')[0]
    this.context = elc.getContext('2d')
  },
  
  draw: function() {
    this.context.fillStyle = "#888888"
    this.context.fillRect(0, 30, 20, 20)
  }
}

Primer.Layer = function() {
  this.children = []
}
