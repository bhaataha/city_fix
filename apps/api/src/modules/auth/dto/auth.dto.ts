import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'כתובת מייל אינה תקינה' })
  @IsNotEmpty({ message: 'נא להזין כתובת מייל' })
  email: string;
}
