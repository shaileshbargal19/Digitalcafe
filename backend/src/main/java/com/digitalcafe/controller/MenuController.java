package com.digitalcafe.controller;

import com.digitalcafe.model.MenuItem;
import com.digitalcafe.service.MenuItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin
public class MenuController {

    @Autowired
    private MenuItemService menuItemService;

    @GetMapping
    public List<MenuItem> getAllItems() {
        return menuItemService.getAllItems();
    }

    @GetMapping("/cafe/{ownerId}")
    public List<MenuItem> getItemsByCafe(@PathVariable Long ownerId) {
        return menuItemService.getItemsByOwner(ownerId);
    }

    @PostMapping("/admin")
    public ResponseEntity<?> addItem(@RequestBody MenuItem item, @RequestParam Long ownerId) {
        System.out.println("DEBUG: addItem called for Owner ID: " + ownerId);
        System.out.println("DEBUG: Item Data: " + item);
        try {
            MenuItem saved = menuItemService.saveItemWithOwner(item, ownerId);
            System.out.println("SUCCESS: Item added with ID: " + saved.getId());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.err.println("ERROR: addItem failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error adding item: " + e.getMessage());
        }
    }

    @PutMapping("/admin/{id}")
    public ResponseEntity<MenuItem> updateItem(@PathVariable Long id, @RequestBody MenuItem item) {
        return ResponseEntity.ok(menuItemService.updateItem(id, item));
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        menuItemService.deleteItem(id);
        return ResponseEntity.ok().build();
    }
}
