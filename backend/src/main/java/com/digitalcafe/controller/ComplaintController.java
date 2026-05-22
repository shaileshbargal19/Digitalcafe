package com.digitalcafe.controller;

import com.digitalcafe.model.Complaint;
import com.digitalcafe.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin
public class ComplaintController {

    @Autowired
    private ComplaintRepository complaintRepository;

    @GetMapping
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitComplaint(@RequestBody Complaint complaint) {
        Complaint saved = complaintRepository.save(complaint);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<?> resolveComplaint(@PathVariable Long id, @RequestBody String response) {
        Optional<Complaint> compOpt = complaintRepository.findById(id);
        if (compOpt.isPresent()) {
            Complaint comp = compOpt.get();
            comp.setStatus("RESOLVED");
            comp.setResponse(response);
            complaintRepository.save(comp);
            return ResponseEntity.ok(comp);
        }
        return ResponseEntity.badRequest().body("Complaint not found");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComplaint(@PathVariable Long id) {
        complaintRepository.deleteById(id);
        return ResponseEntity.ok("Complaint deleted");
    }
}
