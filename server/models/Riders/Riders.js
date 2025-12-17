import mongoose from "mongoose";

const riderSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    orderHistory: {
      type: Array,
      default: null,
      orderDetails: {
        type: Object,
        customer_name: {
          type: String,
          required: true,
        },
        customer_phone: {
          type: String,
          required: true,
        },
        restaurant_name: {
          type: String,
          required: true,
        },
        restaurant_phone: {
          type: String,
          required: true,
        },
        item_name: {
          type: String,
          required: true,
        },
        item_quantity: {
          type: Number,
          required: true,
        },
      },
    },
    currentOrder: {
      type: Array,
      default: null,
      order: {
        type: Object,
        customer_name: {
          type: String,
          required: true,
        },
        customer_phone: {
          type: String,
          required: true,
        },
        restaurant_name: {
          type: String,
          required: true,
        },
        restaurant_phone: {
          type: String,
          required: true,
        },
        item_name: {
          type: String,
          required: true,
        },
        item_quantity: {
          type: Number,
          required: true,
        },
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      email: {
        type: Boolean,
        default: false,
      },
      phone: {
        type: Boolean,
        default: false,
      },
    },
    verificationToken: {
      email: {
        type: String,
        default: null,
      },
      phone: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

const riderModel = mongoose.model(riderSchema);

export default riderModel;
