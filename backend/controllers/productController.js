const supabase = require("../config/supabase");
const { v4: uuidv4 } = require("uuid");

const TABLE_PRODUCTS = "products";
const TABLE_IMAGES = "product_images";

const createProduct = async (req, res) => {
  try {
    const { name, description, category, price, quantity_available, unit } =
      req.body;
    const { providerId } = req;

    const { data: productData, error: productError } = await supabase
      .from(TABLE_PRODUCTS)
      .insert([
        {
          producer_id: providerId,
          name,
          description,
          category,
          price,
          quantity_available,
          unit,
          is_available: true,
          created_at: new Date(),
          modified_at: new Date(),
        },
      ])
      .select();

    if (productError || !productData || productData.length === 0) {
      return res
        .status(500)
        .json({ message: "Failed to create product", error: productError });
    }

    const product = productData[0];

    const uploadedImageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imageExt = file.originalname.split(".").pop();
        const imageName = `${uuidv4()}.${imageExt}`;
        const filePath = `${product.id}/${imageName}`;

        const { error: uploadError } = await supabase.storage
          .from("productimages")
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (uploadError) {
          console.error("Image upload failed:", uploadError);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("productimages")
          .getPublicUrl(filePath);

        uploadedImageUrls.push(urlData.publicUrl);

        await supabase.from(TABLE_IMAGES).insert([
          {
            product_id: product.id,
            image_url: urlData.publicUrl,
          },
        ]);
      }
    }

    return res.status(201).json({
      message: "Product created successfully",
      product,
      images: uploadedImageUrls,
    });
  } catch (err) {
    console.error("Create product failed:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getMyProducts = async (req, res) => {
  try {
    const providerId = req.providerId;
    const { data, error } = await supabase
      .from(TABLE_PRODUCTS)
      .select("*, product_images(*)")
      .eq("producer_id", providerId);

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error("Fetch products failed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const providerId = req.providerId;

    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (fetchError || !product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.producer_id !== providerId) {
      return res.status(403).json({ message: "Forbidden: Not your product" });
    }

    const updatedFields = {
      name: req.body.name ?? product.name,
      description: req.body.description ?? product.description,
      category: req.body.category ?? product.category,
      price: req.body.price ? parseFloat(req.body.price) : product.price,
      quantity_available: req.body.quantity_available
        ? parseInt(req.body.quantity_available)
        : product.quantity_available,
      unit: req.body.unit ?? product.unit,
      is_available:
        req.body.is_available !== undefined
          ? req.body.is_available === "true"
          : product.is_available,
      modified_at: new Date(),
    };

    const { data: updatedProduct, error: updateError } = await supabase
      .from("products")
      .update(updatedFields)
      .eq("id", productId)
      .select();

    if (updateError) {
      return res
        .status(500)
        .json({ message: "Update failed", error: updateError });
    }

    const removeImages = req.body.remove_images;
    if (removeImages) {
      const urlsToRemove = Array.isArray(removeImages)
        ? removeImages
        : [removeImages];

      for (const url of urlsToRemove) {
        const relativePath = url.split("/productimages/")[1];
        if (relativePath) {
          await supabase.storage.from("productimages").remove([relativePath]);
          await supabase
            .from("product_images")
            .delete()
            .eq("product_id", productId)
            .eq("image_url", url);
        }
      }
    }

    const newImageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imageExt = file.originalname.split(".").pop();
        const imageName = `${uuidv4()}.${imageExt}`;
        const filePath = `${productId}/${imageName}`;

        const { error: uploadError } = await supabase.storage
          .from("productimages")
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("productimages")
            .getPublicUrl(filePath);

          newImageUrls.push(urlData.publicUrl);

          await supabase.from("product_images").insert([
            {
              product_id: productId,
              image_url: urlData.publicUrl,
            },
          ]);
        }
      }
    }

    res.status(200).json({
      message: "Product updated",
      product: updatedProduct[0],
      newImages: newImageUrls,
      removedImages: removeImages || [],
    });
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const providerId = req.providerId;

    const { data: images } = await supabase
      .from(TABLE_IMAGES)
      .select("*")
      .eq("product_id", id);
    for (const image of images) {
      const key = `${id}/${image.image_url.split("/").pop()}`;
      await supabase.storage.from("productimages").remove([key]);
    }
    await supabase.from(TABLE_IMAGES).delete().eq("product_id", id);

    const { error } = await supabase
      .from(TABLE_PRODUCTS)
      .delete()
      .eq("id", id)
      .eq("producer_id", providerId);

    if (error) throw error;

    return res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    console.error("Delete product failed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const providerId = req.providerId;

    const { data: product, error: fetchError } = await supabase
      .from(TABLE_PRODUCTS)
      .select("is_available")
      .eq("id", id)
      .eq("producer_id", providerId)
      .single();

    if (fetchError) throw fetchError;

    const { error: updateError } = await supabase
      .from(TABLE_PRODUCTS)
      .update({ is_available: !product.is_available })
      .eq("id", id)
      .eq("producer_id", providerId);

    if (updateError) throw updateError;

    return res.status(200).json({ message: "Availability toggled" });
  } catch (error) {
    console.error("Toggle availability failed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    const { data: product, error } = await supabase
      .from("products")
      .select("*, product_images(*)")
      .eq("id", productId)
      .single();

    if (error || !product) {
      return res.status(404).json({ message: "Product not found", error });
    }

    return res.status(200).json({ product });
  } catch (err) {
    console.error("Get product by ID failed:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  toggleAvailability,
  getProductById,
};
