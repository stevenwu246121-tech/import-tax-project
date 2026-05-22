package com.example.importtax.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.example.importtax.dao.HsCodeDao;
import com.example.importtax.entity.HsCode;

@Service
public class HsCodeService {

    private final HsCodeDao hsCodeDao;

    public HsCodeService(HsCodeDao hsCodeDao) {
        this.hsCodeDao = hsCodeDao;
    }

    public List<HsCode> getAll() {
        return hsCodeDao.findAll();
    }
}