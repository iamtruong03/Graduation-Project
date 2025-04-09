package com.dev.truongdev.xdevbase.service;

import com.dev.truongdev.xdevbase.entity.XDevBaseEntity;
import java.util.List;

public interface IXDevBaseService <E extends XDevBaseEntity>{
  E create(Long cid, String uid, E e);

  E update(Long cid, String uid, E e , Long id);

  void delete(Long cid, String uid, Long id);

  void changeStatus(Long cid, String uid, Long id);

  List<E> getAll(Long cid, String uid);

}
