const request = require("supertest");

const app = require("../app");


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

describe("Get /jobs ",function() {
    test("works for anyone", async function (){
        const res = await request(app).get(`/jobs`)
        expect(res.body).toEqual([
            {
           id: expect.any(Number), 
           title: "JOB 1",
           salary: 100,
           equity: "1.0",
           companyHandle: "c1",
           companyName: "C1"
           },
    
            {
           id: expect.any(Number), 
           title: "JOB 2",
           salary: 200,
           equity: "1.0",
           companyHandle: "c1",
           companyName: "C1"
           },
           
            {
           id: expect.any(Number), 
           title: "JOB 3",
           salary: 300,
           equity: "1.0",
           companyHandle: "c1",
           companyName: "C1"
           },
           
           
           ])

    })

    test("filtering", async function (){
        const res = await request(app).get('/jobs').query({hasEquity: true})
        expect(res.body).toEqual([
            {
                id: expect.any(Number), 
                title: "JOB 1",
                salary: 300,
                equity: "1.0",
                companyHandle: "c1",
                companyName: "C1"
                },

            {
                id: expect.any(Number), 
                title: "JOB 2",
                salary: 300,
                equity: "1.0",
                companyHandle: "c1",
                companyName: "C1"
                },    
        ])
    })

    test("Invalid: Bad Request", async function (){
        const res = await request(app).get(`/jobs`).query({minSalary: 2, nope: "nope"});
        expect(res.statusCode).toEqual(400);
    })
})


describe("Get /jobs/:id", function() {
    test("works for anyone", async function () {
        const  res = await request(app).get(`/jobs/${testJobIds[0]}`);
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
    })

    test("not found", async function (){
        const res = await request(app).get(`/jobs/0`)
        expect(res.statusCode).toEqual(400);

    })
})

describe("Patch /jobs/:id", ()=>{
    test("works for admin", async()=>{
        const res = await (await request(app).patch(`/jobs/${testJobIds[0]}`))
                                             .send({title:"NEW" })
                                             .set("authorization", `Bearer ${adminToken}`);
        expect(res.body).toEqual({
            job: {
                id: expect.any(Number),
                title: "NEW",
                salary: 100,
                equity: "1.0",
                companyHandle: "c1",
            }
        });
    });

        test("unauth for others", async ()=>{
            const res = await (await request(app).patch(`/jobs/${testJobIds[0]}`))
                                     .send({title:"NEW" })
                                     .set("authorization", `Bearer ${adminToken}`);
            expect(res.statusCode).toEqual(401);
        });

    test("Job not found", async ()=>{ 
        const res = await request(app).patch(`/jobs/0`)
                     .send({handle:"NEW" })
                     .set("authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(400);
    })

    test("bad request for handle change", async function (){
        const res = await request(app).patch(`/jobs/${testJobIds[0]}`)
         .send({handle:"NEW" })
         .set("authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(400);
    })

    test("bad request with invalid data", async function (){
        const res = await request(app).patch(`/jobs/${testJobIds[0]}`)
         .send({salary: "string"})
         .set("authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(400);
    })

    
})

describe("DELETE /jobs/:id", function () {
    test("works for admin", async function () {
      const resp = await request(app)
          .delete(`/jobs/${testJobIds[0]}`)
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.body).toEqual({ deleted: testJobIds[0] });
    });
  
    test("unauth for others", async function () {
      const resp = await request(app)
          .delete(`/jobs/${testJobIds[0]}`)
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(401);
    });
  
    test("unauth for anon", async function () {
      const resp = await request(app)
          .delete(`/jobs/${testJobIds[0]}`);
      expect(resp.statusCode).toEqual(401);
    });
  
    test("not found for no such job", async function () {
      const resp = await request(app)
          .delete(`/jobs/0`)
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.statusCode).toEqual(404);
    });
  });describe("DELETE /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .delete(`/jobs/${testJobIds[0]}`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: testJobIds[0] });
  });

  test("unauth for others", async function () {
    const resp = await request(app)
        .delete(`/jobs/${testJobIds[0]}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/jobs/${testJobIds[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .delete(`/jobs/0`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});