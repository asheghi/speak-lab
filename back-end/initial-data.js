const crypto = require('crypto');
const randomString = () => crypto.randomBytes(6).hexSlice();
const mongoose = require('mongoose');

async function seedUsers(keystone) {
    // Count existing users
    const {
        data: {
            _allUsersMeta: {count = 0},
        },
    } = await keystone.executeGraphQL({
        context: keystone.createContext({skipAccessControl: true}),
        query: `query {
                      _allUsersMeta {
                        count
                      }
                }`,
    });

    if (count === 0) {
        const password = randomString();
        const email = 'admin@example.com';

        const {errors} = await keystone.executeGraphQL({
            context: keystone.createContext({skipAccessControl: true}),
            query: `mutation initialUser($password: String, $email: String) {
            createUser(data: {name: "Admin", email: $email, isAdmin: true, password: $password}) {
              id
            }
          }`,
            variables: {password, email},
        });

        if (errors) {
            console.log('failed to create initial user:');
            console.log(errors);
        } else {
            console.log(`

      User created:
        email: ${email}
        password: ${password}
      Please change these details after initial login.
      `);
        }
    }
}

async function seedLessons(keystone) {
    // Count existing users
    const {
        data: {
            _allLessonsMeta: {count = 0},
        },
    } = await keystone.executeGraphQL({
        context: keystone.createContext({skipAccessControl: true}),
        query: `query {
                      _allLessonsMeta {
                        count
                      }
                }`,
    });

    if (count === 0) {
        const password = randomString();
        const email = 'admin@example.com';

        const {errors} = await keystone.executeGraphQL({
            context: keystone.createContext({skipAccessControl: true}),
            query: `mutation initialUser($name: String, $public: Boolean) {
                        createLesson(data: {name: $name ,public: $public,})
                    }`,
            variables: {name:'First Lesson',public:true},
        });

        if (errors) {
            console.log('failed to create initial lesson');
            console.log(errors);
        } else {
            console.log('created lessons.');
        }
    }
}

module.exports = async keystone => {
    console.log("init data called()");
    await seedUsers(keystone);
    await seedLessons(keystone);

  //  console.log('check', keystone);
};
