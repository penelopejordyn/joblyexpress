const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db.js");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe("create job", () => {
    let newJob = {
        companyHandle: "c1",
        title: "TEST",
        salary: 100,
        equity: "1.0"
    };

    test("created job", async function(){
        let job = await Job.create(newJob);
        expect(job).to.equal({
            ...newJob,
            id: expect.any(Number)
        });
    })
})


describe("findAll job", () => {
    test("all jobs, no filter", async function(){
       let jobs = await Job.findAll();
       expect(jobs).toEqual([
        {
            id: testJobIds[0], 
            title: "JOB 1",
            salary: 100,
            equity: "1.0",
            companyHandle: "c1",
            companyName: "C1"
        },
        {
            id: testJobIds[1], 
            title: "JOB 2",
            salary: 100,
            equity: "1.0",
            companyHandle: "c1",
            companyName: "C1"
        },
        {
            id: testJobIds[2], 
            title: "JOB 3",
            salary: 100,
            equity: "1.0",
            companyHandle: "c1",
            companyName: "C1"    

        },
        {
            id: testJobIds[3], 
            title: "JOB 4",
            salary: 100,
            equity: "1.0",
            companyHandle: "c1",
            companyName: "C1"
        }
       ]); 
    });
});

    test("min salary", async function (){
        let jobs = await Job.findall({ minSalary: 250})
        
        expect(jobs).toEqual([
            {
            id: testJobIds[0], 
            title: "JOB 1",
            salary: 300,
            equity: "0",
            companyHandle: "c1",
            companyName: "C1"
            },
        ]);
    });

    test("by equity", async function (){
        let jobs = await Job.findall({hasEquity: true });

        expect(jobs).toEqual([
            {
                id: testJobIds[0], 
                title: "JOB 1",
                salary: 100,
                equity: "1.0",
                companyHandle: "c1",
                companyName: "C1"
            },
            {
                id: testJobIds[1], 
                title: "JOB 2",
                salary: 100,
                equity: "1.0",
                companyHandle: "c1",
                companyName: "C1"
            },
        ]);
    });

    test("by min salary & equity", async function (){
        let jobs = await Job.findall({ minSalary: 100, hasEquity: true });
        expect(jobs).toEqual([
            {
                id: testJobIds[0], 
                title: "JOB 1",
                salary: 150,
                equity: "1.0",
                companyHandle: "c1",
                companyName: "C1"
            },
        ])
    })


    test("by name", async function (){
        let jobs = await Job.findall({ title: "ob1"});
        expect(jobs).toEqual([
         {
        id: testJobIds[0], 
        title: "JOB 1",
        salary: 100,
        equity: "1.0",
        companyHandle: "c1",
        companyName: "C1"
        },
        ])
    })


describe("get job", () => {
    test("search job", async function() {
        let job = await Job.get(testJobIds[0]);
        expect(job).toEqual({
            id: testJobIds[0],
            title: "Job1",
            salary: 100,
            equity: "1.0",
            company: {
                handle: "c1",
                name: "C1",
                description: "Desc1",
                numEmployees: 1,
                logoUrl: "http://c1.img"
            },
        });
    });

    test("job not found", async function() {
        try{
            await Job.get[0];
            fail();
        }catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    })
})

describe("update job", () => {

    let update = { 

        title: "New",
        salary: 100,
        equity: "1.0"
    }

    test('updating', async function(){
        let res = await Job.update(testJobIds[0], update);
        expect(res).toEqual({
            id: testJobIds[0],
            companyHandle: "c1",
            ...update
        })
    })

    test("job not found", async function () {
        try{
            await Job.update(0, {
                title: "err",
            });
            fail();
        }catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    })


})

describe("remove", function () {
    test("delete", async function () {
      await Job.remove(testJobIds[0]);
      const res = await db.query(
          "SELECT id FROM jobs WHERE id=$1", [testJobIds[0]]);
      expect(res.rows.length).toEqual(0);
    });
  
    test("job not found", async function () {
      try {
        await Job.remove(0);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  });
  
