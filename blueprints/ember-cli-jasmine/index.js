module.exports = {
  afterInstall: function() {
    return this.addBowerPackagesToProject([
      {name: 'jasmine', target: '~2.3.4'},
    ]);
  }
};
