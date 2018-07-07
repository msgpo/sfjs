export class SFPredicate {
  constructor(keypath, operator, value) {
    this.keypath = keypath;
    this.operator = operator;
    this.value = value;
  }

  static fromArray(array) {
    var pred = new SFPredicate();
    pred.keypath = array[0];
    pred.operator = array[1];
    pred.value = array[2];
    return pred;
  }

  static ObjectSatisfiesPredicate(object, predicate) {
    var valueAtKeyPath = predicate.keypath.split('.').reduce((previous, current) => {
      return previous && previous[current]
    }, object);

    var predicateValue = predicate.value;
    if(typeof(predicateValue) == 'string' && predicateValue.includes(".ago")) {
      predicateValue = this.DateFromString(predicateValue);
    }

    const falseyValues = [false, "", null, undefined, NaN];

    if(valueAtKeyPath == undefined) {
      return falseyValues.includes(predicate.value);
    }

    if(predicate.operator == "=") {
      // Use array comparison
      if(Array.isArray(valueAtKeyPath)) {
        return JSON.stringify(valueAtKeyPath) == JSON.stringify(predicateValue);
      } else {
        return valueAtKeyPath == predicateValue;
      }
    } else if(predicate.operator == "<")  {
      return valueAtKeyPath < predicateValue;
    } else if(predicate.operator == ">")  {
      return valueAtKeyPath > predicateValue;
    } else if(predicate.operator == "<=")  {
      return valueAtKeyPath <= predicateValue;
    } else if(predicate.operator == ">=")  {
      return valueAtKeyPath >= predicateValue;
    } else if(predicate.operator == "startsWith")  {
      return valueAtKeyPath.startsWith(predicateValue);
    } else if(predicate.operator == "in") {
      return predicateValue.indexOf(valueAtKeyPath) != -1;
    } else if(predicate.operator == "includes") {
      return this.resolveIncludesPredicate(valueAtKeyPath, predicateValue);
    } else if(predicate.operator == "matches") {
      var regex = new RegExp(predicateValue);
      return regex.test(valueAtKeyPath);
    }

    return false;
  }

  static resolveIncludesPredicate(valueAtKeyPath, predicateValue) {
    // includes can be a string  or a predicate (in array form)
    if(typeof(predicateValue) == 'string') {
      // if string, simply check if the valueAtKeyPath includes the predicate value
      return valueAtKeyPath.includes(predicateValue);
    } else {
      // is a predicate array or predicate object
      var innerPredicate;
      if(Array.isArray(predicateValue)) {
        innerPredicate = SFPredicate.fromArray(predicateValue);
      } else {
        innerPredicate = predicateValue;
      }
      for(var obj of valueAtKeyPath) {
        if(this.ObjectSatisfiesPredicate(obj, innerPredicate)) {
          return true;
        }
      }
      return false;
    }
  }

  static ItemSatisfiesPredicate(item, predicate) {
    if(Array.isArray(predicate)) {
      predicate = SFPredicate.fromArray(predicate);
    }
    return this.ObjectSatisfiesPredicate(item, predicate);
  }

  static DateFromString(string) {
    // x.days.ago, x.hours.ago
    var comps = string.split(".");
    var unit = comps[1];
    var date = new Date;
    var offset = parseInt(comps[0]);
    if(unit == "days") {
      date.setDate(date.getDate() - offset);
    } else if(unit == "hours") {
      date.setHours(date.getHours() - offset);
    }
    return date;
  }
}
