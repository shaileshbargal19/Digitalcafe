package com.digitalcafe.service;

import com.digitalcafe.model.MenuItem;
import com.digitalcafe.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MenuItemService {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private com.digitalcafe.repository.UserRepository userRepository;

    public List<MenuItem> getAllItems() {
        return menuItemRepository.findAll();
    }

    public MenuItem saveItem(MenuItem item) {
        return menuItemRepository.save(item);
    }

    public MenuItem saveItemWithOwner(MenuItem item, Long ownerId) {
        userRepository.findById(ownerId).ifPresent(item::setOwner);
        return menuItemRepository.save(item);
    }

    public void deleteItem(Long id) {
        menuItemRepository.deleteById(id);
    }

    public List<MenuItem> getItemsByOwner(Long ownerId) {
        return menuItemRepository.findByOwnerId(ownerId);
    }

    public MenuItem updateItem(Long id, MenuItem itemDetails) {
        MenuItem item = menuItemRepository.findById(id).orElseThrow();
        item.setName(itemDetails.getName());
        item.setDescription(itemDetails.getDescription());
        item.setPrice(itemDetails.getPrice());
        item.setCategory(itemDetails.getCategory());
        item.setAvailable(itemDetails.getAvailable());
        item.setImageUrl(itemDetails.getImageUrl());
        item.setIsFeatured(itemDetails.getIsFeatured());
        return menuItemRepository.save(item);
    }
}
