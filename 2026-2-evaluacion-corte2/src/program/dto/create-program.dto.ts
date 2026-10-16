// TODO Reto 1: reglas de validación con class-validator
//   - name: string, mínimo 3 caracteres
//   - code: string de 3 a 6 letras MAYÚSCULAS (ej. "SIS", "MED")

import { IsString, MinLength, Matches, IsInt, IsPositive, IsUppercase, Length } from "class-validator";

//   - credits: entero positivo
export class CreateProgramDto {

    @IsString()
    @MinLength(3)
    name: string;

    @IsString()
    @IsUppercase()
    @Length(3,6)
    code: string;

    @IsInt()
    @IsPositive()
    credits: number;
}
