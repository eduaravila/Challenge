import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from "class-validator";

@ValidatorConstraint({ name: "IsUndefined", async: false })
export class IsUndefined implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    return !!text ? false : false < true; // for async validations you must return a Promise<boolean> here
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return "You already have a challenge asigned 🧵";
  }
}
