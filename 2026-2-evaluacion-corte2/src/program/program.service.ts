import { ConflictException, HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from 'src/student/entities/student.entity';
import { Repository, DataSource } from 'typeorm';
import { Program } from './entities/program.entity';
import { User } from 'src/user/entities/user.entity';
import { CreateProgramDto } from './dto/create-program.dto';
import { PaginationDto } from 'src/student/dto/pagination.dto';
import { AssignStudentsDto } from './dto/assign-students.dto';
import { BulkCreateProgramDto } from './dto/bulk-create-program.dto';

@Injectable()
export class ProgramService {

    private readonly logger = new Logger("ProgramService");

    // TODO Reto 1: inyecta el repositorio de Program (y lo que necesites para las transacciones)
    constructor(
        @InjectRepository(Program)
        private readonly programRepository: Repository<Program>,
        private readonly datasource: DataSource
    ){}

    // TODO Reto 1: create(createProgramDto, user) -> guarda el programa
    //   - nombre o código repetido -> 409 Conflict (no 500)
    async create(createProgramDto: CreateProgramDto, user: User): Promise<Program>{
        try{
            const program = this.programRepository.create({
                ...createProgramDto,
                createdBy: user
            });
            await this.programRepository.save(program);
            return program;
        }catch(error){
            this.handleException(error);
        }
    }
    // TODO Reto 1: findAll(paginationDto) -> lista paginada (limit / skip)
    async findAll(paginationDto: PaginationDto){
        try{
            const { limit, skip } = paginationDto;
            return await this.programRepository.find({
                take: limit,
                skip: skip
            });
        }catch(error){
            this.handleException(error);
        }
    }

    // TODO Reto 2: findOne(id) -> programa con sus estudiantes, 404 si no existe
    async findOne(id: string): Promise<Program>{
        const program = await this.programRepository.findOne({
            where: { id },
            relations: { students: true }
        });

        if(!program) throw new NotFoundException(`Program with id ${id} not found`);

        return program;
    }

    // TODO Reto 2: assignStudents(id, assignStudentsDto) -> AGREGA estudiantes al programa
    //   dentro de una transacción (QueryRunner), conservando los que ya tenía.
    //   Mismo patrón del update de estudiantes corregido en clase (combinar las notas):
    //   traer los actuales -> combinar con los nuevos -> guardar la lista completa.
    //   Si algún id no existe: 404 y rollback.
    async assignStudents(id: string, assignStudentsDto: AssignStudentsDto): Promise<Program>{
        
        const studentIds = [...new Set(assignStudentsDto.studentIds)];

        const queryRunner = this.datasource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try{

            const program = await queryRunner.manager.findOne(Program, {
                where: { id },
                relations: { students: true }
            });
            if(!program) throw new NotFoundException(`Program with id ${id} not found`);
            for(const studentId of studentIds){
                const student = await queryRunner.manager.findOneBy(Student, { id: studentId });
                if(!student) throw new NotFoundException(`Student with id ${studentId} not found`);

                let exists = false;
                for(const actual of program.students!){
                    if(actual.id === studentId) exists = true;
                }

                if(!exists) program.students!.push(student);
            }

            await queryRunner.manager.save(program);
            await queryRunner.commitTransaction();
            await queryRunner.release();

            return await this.findOne(id);

        }catch(error){
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            this.handleException(error);
        }
    }

    // TODO Reto 3: bulkCreate(bulkCreateProgramDto, user) -> crea todos los programas o ninguno
    //   (transacción). Cualquier nombre/código repetido -> 409 y rollback.
    async bulkCreate(bulkCreateProgramDto: BulkCreateProgramDto, user: User){

    }



    private handleException(error: any): never {
        if (error instanceof HttpException) throw error;
        if (error.code === '23505') throw new ConflictException(error.detail);
        this.logger.error(error);
        throw new InternalServerErrorException('Unexpected error, check server logs');
    }
}


