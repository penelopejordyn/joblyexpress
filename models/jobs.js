const db = require("../db");
const { NotFoundError} = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
    
    
    static async create(data){
        const result = await db.query(
            `INSET INTO jobs 
            (title, salary, equity, company_handle)
            VALUES 
            ($1, $2, $3, $4) 
            RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
            [data.title, data.salary, data.equity, data.companyHandle]
        );
        return result.row[0];
    }

    static async findall({ minSalary, hasEquity, title} = {}) {
        let query = `SELECT 
                    j.id, j.title, j.equity, j.salary, j.company_handle AS "companyHandle",
                    c.name AS "companyName"
                    FROM jobs AS j
                    LEFT JOIN companies AS c ON c.handle = j.company_handle`;
        
        let whereExpressions = [];
        let queryValues = [];

        if(minSalary !== undefined){
            queryValues.push(minSalary);
            whereExpressions.push(`salary >= $${queryValues.length}`)
        }

        if (hasEquity === true){
            whereExpressions.push(`equity > 0`);
        
        }

        if(title !== undefined){
            queryValues.push(`%${title}%`);
            whereExpressions.push(`title ILIKE $${queryValues.length}`);
        }

        if (whereExpressions.length > 0){
            query += "WHERE" + whereExpressions.join("AND")
        }

        query += " ORDER BY title";
        const results = await db.query(query, queryValues);
        return results.rows;
    }

    static async get(id) {
        const res = await db.query(
            `SELECT id, title, salary, equity, company_handle AS "companyHandle"
            FROM jobs WHERE id = $1`, [id]
        );

        const searchJob = res.rows[0];

        if(!searchJob) {
            throw new NotFoundError(`Not Found ${id}`);
        }

        const compRes =  await db.query(
            `SELECT 
            handle, name, description, num_employees AS "numEmployees", logo_url AS "logoURL"
            FROM companies WHERE handle = $1`, [job.companyHandle]
        );

        delete searchJob.companyHandle;
        searchJob.company = compRes.rows[0];

        return searchJob
    }

    static async update(id,data){
        const { setCols, values} = sqlForPartialUpdate(data,{});

        const idVal = "$" + (values.length + 1);

        const query = ` UPDATE jobs SET ${setCols} WHERE id = ${idVal}
                        RETURNING id, title, salary, equity, company_handle AS "companyHandle"`;
        
        const result = await db.query(query, [...values, id]);
        const job = result.rows[0];

        if(!job){
            throw new NotFoundError(`No Job: ${id}`)
        }
    }

    static async delete(id){
        const result = await db.query(
            `DELETE FROM jobs WHERE id = $1
            RETURNING id`, [id]);

        const job = result.rows[0];

        if(!job) {
            throw new NotFoundError(`No job: ${id}`)
        }
    }
}

module.exports = Job;