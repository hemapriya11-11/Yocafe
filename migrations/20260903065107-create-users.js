export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("users", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },

    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    role: {
      type: Sequelize.ENUM("customer", "admin"),
      allowNull: false,
      defaultValue: "customer",
    },

    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },

    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("users");
}