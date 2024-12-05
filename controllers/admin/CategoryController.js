const Category=require('../../models/Category.js');

const addCategory = async (req, res) => {
    const { Category: categoryName } = req.body;
    if (!categoryName) {
        return res.status(400).json({ success: false, message: 'Category name is required' });
    }
    const lowercaseCategory = categoryName.toLowerCase();
    try {
        const existingCategory = await Category.findOne({ Category: lowercaseCategory });
        if (existingCategory) {
            return res.status(400).json({ success: false, message: 'Category already exists' });
        }
        const newCategory = new Category({ Category: lowercaseCategory });
        await newCategory.save();
        return res.status(201).json({ success: true, data: newCategory });
    } catch (error) {
        console.error("Error adding category:", error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
const getCategories = async (req, res) => {
    try {
      const categories = await Category.find();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error fetching categories." });
    }
  };
// remove a category
const removeCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await Category.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Category removed successfully.' });
    } catch (error) {
        console.error('Error removing category:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
//  edit a category
const editCategory = async (req, res) => {
    const { id } = req.params;
    const { Category: newCategoryName } = req.body;

    if (!newCategoryName) {
        return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    try {
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { Category: newCategoryName },
            { new: true } 
        );

        if (!updatedCategory) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }

        res.status(200).json({ success: true, data: updatedCategory });
    } catch (error) {
        console.error('Error editing category:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const blockorUnblock = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        category.isBlocked = !category.isBlocked; 
        const updatedCategory = await category.save();

        res.json({ success: true, data: updatedCategory }); 
    } catch (error) {
        console.error("Error toggling category status:", error);
        res.status(500).json({ success: false, message: "Server error: " + error.message });
    }
};


  module.exports={addCategory,getCategories,removeCategory,blockorUnblock,editCategory}