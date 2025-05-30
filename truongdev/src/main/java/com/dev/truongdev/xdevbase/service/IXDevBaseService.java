package com.dev.truongdev.xdevbase.service;

import com.dev.truongdev.xdevbase.dto.XDevBaseFilter;
import com.dev.truongdev.xdevbase.entity.XDevBaseEntity;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IXDevBaseService <
    E extends XDevBaseEntity,
    F extends XDevBaseFilter>{
  E create(String uid, E e);

  E update(String uid, E e , Long id);

  void delete(String uid, Long id);

  void changeStatus(String uid, Long id);

  E getById(String uid, Long id);

  List<E> getAll(Long id, String uid);

  Page<E> searchAll(Long did, String uid, F filter, Pageable pageable);

}
