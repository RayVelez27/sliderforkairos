const employees = document.querySelector("#employees")
var labels = { 0: '0', 10: '10', 15: '15', 20: '20', 25: '25', 40: '40', 55: '55', 70: '70', 85: '85', 100: '100', 110: '100+', };
noUiSlider.create(employees, {
  start: 10,
  connect: [true, false],
  tooltips: {
    to: function(value) {
        return value > 100 ? '100+' : parseInt(value)
    }
  },
  range: {
    'min': 0,
    '10%': 10,
    '20%': 15,
    '30%': 20,
    '40%': 25,
    '50%': 40,
    '60%': 55,
    '70%': 70,
    '80%': 85,
    '90%': 100,
    'max': 110
  },
  pips: {
    mode: 'steps',
    filter: function (value, type) {
      return type === 0 ? -1 : 1;
    },
    format: {
      to: function (value) {
        return labels[value];
      }
    }
  }
});
