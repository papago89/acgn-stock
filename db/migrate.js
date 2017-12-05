'use strict';
import { _ } from 'meteor/underscore';
import { Meteor } from 'meteor/meteor';
import { MongoInternals } from 'meteor/mongo';
import { Migrations } from 'meteor/percolate:migrations';
import { dbAdvertising } from './dbAdvertising';
import { dbArena } from '/db/dbArena';
import { dbArenaFighters } from '/db/dbArenaFighters';
import { dbArenaLog } from '/db/dbArenaLog';
import { dbCompanies } from './dbCompanies';
import { dbCompanyArchive } from './dbCompanyArchive';
import { dbDirectors } from './dbDirectors';
import { dbFoundations } from './dbFoundations';
import { dbLog } from './dbLog';
import { dbOrders } from './dbOrders';
import { dbPrice } from './dbPrice';
import { dbProducts } from './dbProducts';
import { dbProductLike } from './dbProductLike';
import { dbRankCompanyPrice } from './dbRankCompanyPrice';
import { dbRankCompanyProfit } from './dbRankCompanyProfit';
import { dbRankCompanyValue } from './dbRankCompanyValue';
import { dbRankUserWealth } from './dbRankUserWealth';
import { dbRound } from './dbRound';
import { dbRuleAgendas } from './dbRuleAgendas';
import { dbSeason } from './dbSeason';
import { dbTaxes } from './dbTaxes';
import { dbUserArchive } from './dbUserArchive';
import { dbValidatingUsers } from './dbValidatingUsers';
import { dbVariables } from '/db/dbVariables';
import { dbVoteRecord } from './dbVoteRecord';

if (Meteor.isServer) {
  Migrations.add({
    version: 1,
    name: 'Create indexes.',
    up() {
      dbAdvertising.rawCollection().createIndex({
        paid: -1
      });
      dbCompanies.rawCollection().createIndex({
        companyName: 1
      });
      dbCompanies.rawCollection().createIndex(
        {
          lastPrice: -1
        },
        {
          partialFilterExpression: {
            isSeal: false
          }
        }
      );
      dbCompanies.rawCollection().createIndex(
        {
          listPrice: -1
        },
        {
          partialFilterExpression: {
            isSeal: false
          }
        }
      );
      dbCompanies.rawCollection().createIndex(
        {
          totalValue: -1
        },
        {
          partialFilterExpression: {
            isSeal: false
          }
        }
      );
      dbCompanies.rawCollection().createIndex(
        {
          profit: -1
        },
        {
          partialFilterExpression: {
            isSeal: false
          }
        }
      );
      dbCompanies.rawCollection().createIndex(
        {
          createdAt: -1
        },
        {
          partialFilterExpression: {
            isSeal: false
          }
        }
      );
      dbCompanies.rawCollection().createIndex(
        {
          manager: 1
        },
        {
          partialFilterExpression: {
            isSeal: false
          }
        }
      );
      dbDirectors.rawCollection().createIndex({
        companyId: 1,
        stocks: -1,
        createdAt: 1
      });
      dbDirectors.rawCollection().createIndex(
        {
          companyId: 1,
          userId: 1
        },
        {
          unique: true
        }
      );
      dbDirectors.rawCollection().createIndex({
        userId: 1
      });
      dbFoundations.rawCollection().createIndex({
        companyName: 1
      });
      dbFoundations.rawCollection().createIndex({
        createdAt: 1
      });
      dbLog.rawCollection().createIndex({
        createdAt: -1
      });
      dbLog.rawCollection().createIndex({
        companyId: 1,
        createdAt: -1
      });
      dbLog.rawCollection().createIndex({
        userId: 1,
        createdAt: -1
      });
      dbOrders.rawCollection().createIndex({
        companyId: 1,
        userId: 1
      });
      dbOrders.rawCollection().createIndex(
        {
          companyId: 1,
          unitPrice: -1,
          createdAt: 1
        },
        {
          partialFilterExpression: {
            orderType: '購入'
          }
        }
      );
      dbOrders.rawCollection().createIndex(
        {
          companyId: 1,
          unitPrice: 1,
          createdAt: 1
        },
        {
          partialFilterExpression: {
            orderType: '賣出'
          }
        }
      );
      dbOrders.rawCollection().createIndex({
        userId: 1
      });
      dbPrice.rawCollection().createIndex({
        companyId: 1,
        createdAt: -1
      });
      dbPrice.rawCollection().createIndex({
        createdAt: 1
      });
      dbProducts.rawCollection().createIndex({
        overdue: 1
      });
      dbProducts.rawCollection().createIndex({
        companyId: 1,
        overdue: 1
      });
      dbProducts.rawCollection().createIndex(
        {
          seasonId: 1,
          votes: -1
        },
        {
          partialFilterExpression: {
            overdue: {
              $gt: 0
            }
          }
        }
      );
      dbProducts.rawCollection().createIndex(
        {
          companyId: 1,
          likeCount: -1
        },
        {
          partialFilterExpression: {
            overdue: {
              $gt: 0
            }
          }
        }
      );
      dbProductLike.rawCollection().createIndex({
        companyId: 1,
        userId: 1
      });
      dbRankCompanyPrice.rawCollection().createIndex({
        season: 1
      });
      dbRankCompanyProfit.rawCollection().createIndex({
        season: 1
      });
      dbRankCompanyValue.rawCollection().createIndex({
        season: 1
      });
      dbRankUserWealth.rawCollection().createIndex({
        season: 1
      });
      dbSeason.rawCollection().createIndex({
        beginDate: -1
      });
      dbValidatingUsers.rawCollection().createIndex({
        username: 1
      });
      dbVoteRecord.rawCollection().createIndex(
        {
          companyId: 1,
          userId: 1
        },
        {
          unique: true
        }
      );
    }
  });

  Migrations.add({
    version: 2,
    name: 'add chairman/chairmanStocks into companies.',
    up() {
      dbCompanies
        .find(
          {},
          {
            fields: {
              _id: 1
            }
          }
        ).forEach((companyData) => {
          const chairmanData = dbDirectors.findOne(
            {
              companyId: companyData._id
            },
            {
              sort: {
                stocks: -1,
                createdAt: 1
              },
              fields: {
                userId: 1
              }
            }
          );
          if (chairmanData) {
            dbCompanies.update(companyData._id, {
              $set: {
                chairman: chairmanData._id
              }
            });
          }
        });
    }
  });

  Migrations.add({
    version: 3,
    name: 'users add profile.validateType field.',
    up() {
      Meteor.users.update(
        {
          'services.google': {
            $exists: true
          }
        },
        {
          $set: {
            'profile.validateType': 'Google'
          }
        },
        {
          multi: true
        }
      );
      Meteor.users.update(
        {
          'username': {
            $exists: true
          }
        },
        {
          $set: {
            'profile.validateType': 'PTT'
          }
        },
        {
          multi: true
        }
      );
    }
  });

  Migrations.add({
    version: 4,
    name: 'taxes index, users add lastSeasonTotalWealth and noLoginDayCount field.',
    up() {
      dbTaxes.rawCollection().createIndex({
        userId: 1
      });
      Meteor.users.update(
        {},
        {
          $set: {
            'profile.lastSeasonTotalWealth': 0,
            'profile.noLoginDayCount': 0
          }
        },
        {
          multi: true
        }
      );
    }
  });

  Migrations.add({
    version: 5,
    name: 'change !system director data to !FSC director data.',
    up() {
      dbDirectors.update(
        {
          userId: '!system'
        },
        {
          $set: {
            userId: '!FSC'
          }
        },
        {
          multi: true
        }
      );
    }
  });

  Migrations.add({
    version: 6,
    name: 'users add favorite',
    up() {
      Meteor.users.update(
        {},
        {
          $set: {
            favorite: []
          }
        },
        {
          multi: true
        }
      );
    }
  });

  Migrations.add({
    version: 7,
    name: 'season add companies count field.',
    up() {
      dbSeason.update(
        {},
        {
          $set: {
            companiesCount: 0
          }
        },
        {
          multi: true
        }
      );
    }
  });

  Migrations.add({
    version: 8,
    name: 're define dbProduct seasonId field.',
    up() {
      const seasonIdList = dbSeason
        .find({}, {
          sort: {
            beginDate: -1
          },
          fields: {
            _id: 1
          }
        })
        .map((seasonData) => {
          return seasonData._id;
        });
      _.each(seasonIdList, (seasonId, index) => {
        const shouldBeSeasonId = index > 0 ? seasonIdList[index - 1] : '';
        dbProducts.update(
          {
            seasonId: seasonId
          },
          {
            $set: {
              seasonId: shouldBeSeasonId
            }
          },
          {
            multi: true
          }
        );
      });
    }
  });

  Migrations.add({
    version: 9,
    name: 'company add salary, nextSeasonSalary and seasonalBonusPercent field.',
    up() {
      dbCompanies.update(
        {},
        {
          $set: {
            salary: Meteor.settings.public.defaultCompanySalaryPerDay,
            nextSeasonSalary: Meteor.settings.public.defaultCompanySalaryPerDay,
            seasonalBonusPercent: Meteor.settings.public.defaultSeasonalBonusPercent
          }
        },
        {
          multi: true
        }
      );
    }
  });

  Migrations.add({
    version: 10,
    name: 'ruleAgenda add creator field.',
    up() {
      dbRuleAgendas.find().forEach((agenda) => {
        dbRuleAgendas.update(
          {
            _id: agenda._id
          },
          {
            $set: {
              creator: agenda.proposer
            }
          }
        );
      });
    }
  });

  Migrations.add({
    version: 11,
    name: 'rename user.profile.lastReadFscAnnouncementDate to user.profile.lastReadAccuseLogDate',
    up() {
      Meteor.users.update({
        lastReadFscAnnouncementDate: 1
      }, {
        $rename: { lastReadFscAnnouncementDate: 'lastReadAccuseLogDate' }
      });
    }
  });

  Migrations.add({
    version: 12,
    name: 'round system',
    up() {
      dbRound.rawCollection().createIndex({
        beginDate: -1
      });
      const firstSeasonData = dbSeason.findOne({}, {
        sort: {
          beginDate: 1
        }
      });
      let beginDate;
      if (firstSeasonData) {
        beginDate = firstSeasonData.beginDate;
      }
      else {
        beginDate = new Date();
      }
      const roundTime = Meteor.settings.public.seasonTime * Meteor.settings.public.seasonNumberInRound;
      const endDate = new Date(beginDate.setMinutes(0, 0, 0) + roundTime);
      dbRound.insert({beginDate, endDate});

      if (dbCompanies.find().count()) {
        const companyArchiveBulk = dbCompanyArchive.rawCollection().initializeUnorderedBulkOp();
        dbCompanies
          .find({})
          .forEach((companyData) => {
            companyArchiveBulk.insert({
              _id: companyData._id,
              status: 'market',
              name: companyData.companyName,
              tags: companyData.tags,
              pictureSmall: companyData.pictureSmall,
              pictureBig: companyData.pictureBig,
              description: companyData.description
            });
          });
        companyArchiveBulk.execute();
      }
      if (dbFoundations.find().count()) {
        const companyArchiveBulk = dbCompanyArchive.rawCollection().initializeUnorderedBulkOp();
        dbFoundations
          .find()
          .forEach((companyData) => {
            companyArchiveBulk.insert({
              _id: companyData._id,
              status: 'foundation',
              name: companyData.companyName,
              tags: companyData.tags,
              pictureSmall: companyData.pictureSmall,
              pictureBig: companyData.pictureBig,
              description: companyData.description
            });
          });
        companyArchiveBulk.execute();
      }
      if (Meteor.users.find().count()) {
        const userBulk = Meteor.users.rawCollection().initializeUnorderedBulkOp();
        let hasGoogleUser = false;
        const userArchiveBulk = dbUserArchive.rawCollection().initializeUnorderedBulkOp();
        Meteor.users.find().forEach((userData) => {
          let userName = userData.profile.name;
          if (userData.profile.validateType === 'Google') {
            hasGoogleUser = true;
            userName = userData.services.google.email;
            userBulk
              .find({
                _id: userData._id
              })
              .updateOne({
                $set: {
                  'profile.name': userName
                }
              });
          }
          userArchiveBulk.insert({
            _id: userData._id,
            status: 'registered',
            name: userName,
            validateType: userData.profile.validateType,
            isAdmin: userData.profile.isAdmin,
            stone: userData.profile.stone,
            ban: userData.profile.ban
          });
        });
        if (hasGoogleUser) {
          userBulk.execute();
        }
        userArchiveBulk.execute();
      }
      dbCompanyArchive.rawCollection().createIndex(
        {
          name: 1
        },
        {
          unique: true
        }
      );
      dbCompanyArchive.rawCollection().createIndex({
        status: 1
      });
      dbUserArchive.rawCollection().createIndex(
        {
          name: 1,
          validateType: 1
        },
        {
          unique: true
        }
      );
    }
  });

  Migrations.add({
    version: 13,
    name: 'arena system',
    up() {
      dbArena.rawCollection().createIndex({
        beginDate: 1
      });
      dbArenaFighters.rawCollection().createIndex(
        {
          arenaId: 1,
          companyId: 1
        },
        {
          unique: true
        }
      );
      dbArenaLog.rawCollection().createIndex(
        {
          arenaId: 1,
          sequence: 1
        },
        {
          unique: true
        }
      );
      const lastSeasonData = dbSeason.findOne({}, {
        sort: {
          beginDate: -1
        }
      });
      if (lastSeasonData) {
        const {beginDate, endDate} = lastSeasonData;
        const arenaEndDate = new Date(endDate.getTime() + Meteor.settings.public.seasonTime * Meteor.settings.public.arenaIntervalSasonNumber);
        dbArena.insert({
          beginDate: beginDate,
          endDate: arenaEndDate,
          joinEndDate: new Date(arenaEndDate.getTime() - Meteor.settings.public.electManagerTime),
          shuffledFighterCompanyIdList: []
        });
      }
      dbVariables.set('arenaCounter', Meteor.settings.public.arenaIntervalSasonNumber);
    }
  });

  Migrations.add({
    version: 14,
    name: 'log - adjust schema & indexing logType',
    up() {
      dbLog.rawCollection().createIndex({ logType: 1, createdAt: -1 });

      const logCursor = dbLog.find({ data: { $exists: false }});
      if (logCursor.count() === 0) {
        return;
      }

      let logBulk = dbLog.rawCollection().initializeUnorderedBulkOp();

      logCursor.forEach((logData, i) => {
        const updateOperations = {
          $unset: {
            productId: 1,
            price: 1,
            amount: 1,
            message: 1
          }
        };

        // 將與 indexes 無關的 fields 移至 data，並重新給予適當名稱
        switch (logData.logType) {
          case '驗證通過':
            updateOperations.$set = {
              'data.money': logData.price
            };
            break;

          case '登入紀錄':
            updateOperations.$set = {
              'data.ipAddr': logData.message
            };
            break;

          case '免費得石':
            updateOperations.$set = {
              'data.reason': logData.message,
              'data.stones': logData.amount
            };
            break;

          case '聊天發言':
            updateOperations.$set = {
              'data.message': logData.message
            };
            break;

          case '發薪紀錄':
            updateOperations.$set = {
              'data.salary': logData.price
            };
            break;

          case '公司復活':
            updateOperations.$set = {
              'data.manager': logData.message
            };
            break;

          case '創立公司':
            updateOperations.$set = {
              'data.companyName': logData.message
            };
            break;

          case '參與投資':
            updateOperations.$set = {
              'data.companyName': logData.message,
              'data.fund': logData.amount
            };
            break;

          case '創立失敗':
            updateOperations.$set = {
              'data.companyName': logData.message
            };
            break;

          case '創立退款':
            updateOperations.$set = {
              'data.companyName': logData.message,
              'data.refund': logData.amount
            };
            break;

          case '創立成功':
            updateOperations.$set = {
              'data.price': logData.price
            };
            break;

          case '創立得股':
            updateOperations.$set = {
              'data.fund': logData.price,
              'data.stocks': logData.amount
            };
            break;

          case '購買下單':
          case '販賣下單':
          case '公司釋股':
          case '交易紀錄':
            updateOperations.$set = {
              'data.price': logData.price,
              'data.amount': logData.amount
            };
            break;

          case '取消下單':
          case '系統撤單':
          case '訂單完成':
            updateOperations.$set = {
              'data.orderType': logData.message,
              'data.price': logData.price,
              'data.amount': logData.amount
            };
            break;

          case '推薦產品':
            updateOperations.$set = {
              'data.productId': logData.productId,
              'data.profit': logData.price
            };
            break;

          case '員工營利':
            updateOperations.$set = {
              'data.profit': logData.price
            };
            break;

          case '公司營利':
            updateOperations.$set = {
              'data.profit': logData.amount
            };
            break;

          case '營利分紅':
            updateOperations.$set = {
              'data.bonus': logData.amount
            };
            break;

          case '季度賦稅':
            updateOperations.$set = {
              'data.assetTax': logData.amount,
              'data.zombieTax': logData.price
            };
            break;

          case '繳納稅金':
            updateOperations.$set = {
              'data.paid': logData.amount
            };
            break;

          case '繳稅逾期':
            updateOperations.$set = {
              'data.fine': logData.amount
            };
            break;

          case '繳稅沒金':
            updateOperations.$set = {
              'data.money': logData.amount
            };
            break;

          case '繳稅沒收':
            updateOperations.$set = {
              'data.price': logData.price,
              'data.stocks': logData.amount
            };
            break;

          case '廣告宣傳':
          case '廣告追加':
            updateOperations.$set = {
              'data.cost': logData.price,
              'data.message': logData.message
            };
            break;

          case '舉報違規':
            updateOperations.$set = {
              'data.reason': logData.message,
              'data.ipAddr': logData.userId[2],
              'userId': logData.userId.slice(0, 2)
            };
            break;

          case '金管通告':
          case '通報金管':
            updateOperations.$set = {
              'data.message': logData.message
            };
            break;

          case '禁止舉報':
          case '禁止下單':
          case '禁止聊天':
          case '禁止廣告':
          case '禁任經理':
          case '解除舉報':
          case '解除下單':
          case '解除聊天':
          case '解除廣告':
          case '解除禁任':
          case '查封關停':
          case '解除查封':
            updateOperations.$set = {
              'data.reason': logData.message
            };
            break;

          case '課以罰款':
          case '退還罰款':
            updateOperations.$set = {
              'data.reason': logData.message,
              'data.fine': logData.amount
            };
            break;

          case '沒收股份':
            updateOperations.$set = {
              'data.reason': logData.message,
              'data.stocks': logData.amount
            };
            break;

          case '公司更名':
            updateOperations.$set = {
              'data.oldCompanyName': logData.message
            };
            break;

          case '產品下架':
            updateOperations.$set = {
              'data.productId': logData.productId,
              'data.reason': logData.message,
              'data.profit': logData.price
            };
            break;

          case '撤銷廣告':
            updateOperations.$set = {
              'data.message': logData.message
            };
            break;

          case '亂鬥報名':
            break;

          case '亂鬥加強':
            updateOperations.$set = {
              'data.attrName': logData.message,
              'data.money': logData.amount
            };
            break;

          case '亂鬥營利':
            updateOperations.$set = {
              'data.reward': logData.amount
            };
            break;
        }

        logBulk.find({ _id: new MongoInternals.NpmModule.ObjectID(logData._id._str) }).updateOne(updateOperations);

        if (i % 100000 === 0) {
          logBulk.execute();
          logBulk = dbLog.rawCollection().initializeUnorderedBulkOp();
        }
      });

      logBulk.execute();
    }
  });

  Meteor.startup(() => {
    Migrations.migrateTo('latest');
  });
}
