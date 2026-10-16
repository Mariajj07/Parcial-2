// TODO Reto 1: reglas de validación con class-validator
//   - name: string, mínimo 3 caracteres
//   - code: string de 3 a 6 letras MAYÚSCULAS (ej. "SIS", "MED")
//   - credits: entero positivo

import { Transform } from "class-transformer";
import { IsString, MinLength, Matches, IsInt, IsPositive, IsUppercase, Length, Min, Max } from "class-validator";

export class CreateProgramDto {

    @IsString()
    @MinLength(3)
    name: string;

    @IsString()
    @Transform(({ value }) => typeof value === "string" ? value.toUpperCase() : value)
    @IsUppercase()
    @Min(3)
    @Max(6)
    code: string;

    @IsInt()
    @IsPositive()
    credits: number;
}
