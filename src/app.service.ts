import { Injectable } from '@nestjs/common';

import sql = require('mssql');

@Injectable()
export class AppService {
  sqlConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME,
    server: process.env.DB_SERVER,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    },
    options: {
      encrypt: true, // for azure
      trustServerCertificate: true // change to true for local dev / self-signed certs
    }
  };

  getHello(): string {
    return 'This API returns DATA from Honeywell BRNO, any use other than the intended use is not allowed';
  }

  async getTnaPW(
    starttime: string,
    endtime: string
  ): Promise<{
    recordset: { REC_DAT: string; OsCislo: string; DatumACas: string }[];
    rowsAffected: number;
  }> {
    const response: {
      recordset: { REC_DAT: string; OsCislo: string; DatumACas: string }[];
      rowsAffected: number;
    } = {
      recordset: [
        {
          REC_DAT: 'record_date',
          OsCislo: 'DUMMY',
          DatumACas: '1753-00-00 00:00:00.000'
        }
      ],
      rowsAffected: 0
    };
    return new Promise(async (resolve, reject) => {
      try {
        //connect sql
        await sql.connect(this.sqlConfig);
        //create prepared statement and inputs
        const ps = new sql.PreparedStatement();
        ps.input('starttime', sql.DateTime);
        ps.input('endtime', sql.DateTime);
        //prepare Statement
        ps.prepare(
          `SELECT REC_DAT, LEFT(BADGE_PERS_NUMBER collate DATABASE_DEFAULT,7) AS OsCislo, EVNT_DAT AS DatumACas FROM EV_LOG INNER JOIN BADGE_V ON BADGE_V.ID = BADGENO  WHERE EVNT_DAT >= @starttime  AND EVNT_DAT < @endtime`,
          (err) => {
            if (err != null) {
              console.log(err);
              reject(err);
            }
            //Execute Statement with given start-/endtime
            ps.execute(
              { starttime: starttime, endtime: endtime },
              (err, result) => {
                if (err != null) {
                  console.log(err);
                  reject(err);
                }

                response.recordset = [...result.recordset];
                response.rowsAffected = result.rowsAffected[0];

                // release the connection after queries are executed
                ps.unprepare((err) => {
                  if (err != null) {
                    console.log(err);
                    reject(err);
                  }

                  resolve(response);
                });
              }
            );
          }
        );
      } catch (err) {
        reject(err);
      }
    });
  }
}

/**
 * `SELECT REC_DAT, LEFT(BADGE_PERS_NUMBER collate DATABASE_DEFAULT,7) AS OsCislo, EVNT_DAT AS DatumACas FROM EV_LOG INNER JOIN BADGE_V ON BADGE_V.ID = BADGENO  WHERE EVNT_DAT >= @starttime  AND EVNT_DAT < @endtime`,
 */
