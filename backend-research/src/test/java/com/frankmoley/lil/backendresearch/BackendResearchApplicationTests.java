package com.frankmoley.lil.backendresearch;

import com.frankmoley.lil.backendresearch.entity.Paper;
import com.frankmoley.lil.backendresearch.repository.PaperRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest
class BackendResearchApplicationTests {

    @Autowired
    private PaperRepository paperRepository;

    @Test
    void contextLoads() {
        System.out.println("====== DIAGNOSTIC TEST START ======");
        try {
            List<Paper> papers = paperRepository.findAll();
            System.out.println("FOUND " + papers.size() + " PAPERS:");
            for (Paper p : papers) {
                System.out.println("Paper ID: " + p.getId() + ", Title: " + p.getTitle() + ", Status: " + p.getStatus() + ", IsPublished: " + p.getIsPublished() + ", AdminApprovalStatus: " + p.getAdminApprovalStatus());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        System.out.println("====== DIAGNOSTIC TEST END ======");
    }

}
