

module.exports = function connect(from, to) {

  // Precaution
  if (!from || !to) {
    console.warn("Need from and to");
    return;
  }

  from = from.position || from;
  to = to.position || to;

  var p = new Path.Line(from, to);
  p.strokeColor = 'grey';
  p.dashArray = [1, 2];
  return p;

};
