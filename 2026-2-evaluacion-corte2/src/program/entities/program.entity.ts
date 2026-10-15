// TODO Reto 1: convierte esta clase en una entidad de TypeORM (tabla "program") con:
//   - id: UUID generado automáticamente
//   - name: text, único
//   - code: text, único
//   - credits: int
// TODO Reto 2: relación 1:N con Student -> propiedad `students?: Student[]`
// TODO Reto 4: relación N:1 con User -> propiedad `createdBy?: User` (el admin que lo creó)
//
// Usa imports relativos (ej. "../../student/entities/student.entity"), no "src/...":

import { IsString } from "class-validator";
import { Student } from "src/student/entities/student.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
 
@Entity("program")
export class Program {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({
        type: "text",
        unique: true
    })
    name: string;

    @Column({
        type: "text",
        unique: true
    })
    code: string;

    @Column("int")
    credits: number;

    @OneToMany(
        () => Student,
        (student) => student.program
    )
    students?: Student[];

    @ManyToOne(
        () => User,
        { onDelete: "SET NULL" }
    )
    createdBy?: User;
}


