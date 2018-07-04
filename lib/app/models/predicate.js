export class SFPredicate {
  constructor(keypath, operator, value) {
    this.keypath = keypath;
    this.operator = operator;
    this.value = value;
  }

  static ObjectSatisfiesPredicate(object, predicate) {
    var valueAtKeyPath = predicate.keypath.split('.').reduce((previous, current) => {
      return previous && previous[current]
    }, object);

    var predicateValue = predicate.value;
    if(typeof(predicateValue) == 'string' && predicateValue.includes(".ago")) {
      predicateValue = this.DateFromString(predicateValue);
    }

    if(valueAtKeyPath == undefined) {
      if(predicate.value == undefined) {
        // both are undefined, so technically matching
        return true;
      } else {
        return false;
      }
    }

    if(Array.isArray(valueAtKeyPath)) {
      if(predicate.operator == "includes") {
        if(typeof(predicateValue) == 'object') {
          var matchingObjects = [];
          var innerPredicate = predicateValue;
          for(var obj of valueAtKeyPath) {
            if(this.ObjectSatisfiesPredicate(obj, innerPredicate)) {
              return true;
            }
          }
          return false;
        } else {
          return valueAtKeyPath.includes(predicateValue);
        }
      }

      if(predicate.operator != "=") {
        console.error(`Arrays do not support the ${predicate.operator} operator.`);
        return false;
      }

      return JSON.stringify(valueAtKeyPath) == JSON.stringify(predicateValue);
    }

    if(predicate.operator == "=") {
      return valueAtKeyPath == predicateValue;
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
    }

    return false;
  }

  static ItemSatisfiesPredicate(item, predicate) {
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
